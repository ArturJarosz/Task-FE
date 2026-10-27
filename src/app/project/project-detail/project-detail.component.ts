import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ProjectContractForm, ProjectCreateForm, ProjectFormProvider} from "../form/project-form-provider";
import {cloneDeep} from 'lodash';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Architect} from "../../generated/models/architect";
import {Project} from "../../generated/models/project";
import {Installment} from "../../generated/models/installment";
import {ConfigurationEntry, Contract, ContractStatus, ProjectStatus} from "../../generated/models";
import {ContractStore} from "../contract-status/state/contract.store";
import {toDateIfExists, toTimeZoneString} from "../../shared/utils/date-utils";
import {FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";
import {StageListShellComponent} from "../../stage/stage-list-shell/stage-list-shell.component";
import {ProjectTimelineComponent} from "../project-timeline/project-timeline.component";
import {ProjectFinancialDetailShellComponent} from "../../finance/project-financial-summary/project-financial-detail-shell/project-financial-detail-shell.component";
import {SelectModule} from "primeng/select";
import {DatePickerModule} from "primeng/datepicker";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {TagModule} from "primeng/tag";
import {DialogModule} from "primeng/dialog";
import {MenuModule} from "primeng/menu";
import {SkeletonModule} from "primeng/skeleton";
import {NgFor, NgIf, CurrencyPipe, DatePipe} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";

export type ProjectDetailView = 'overview' | 'stages' | 'timeline' | 'finance';

export interface ProjectPerson {
    initials: string;
    name: string;
    role: string;
    route: (string | number)[];
    avatarClass: string;
}

// Semicircle gauge in the Payments card: arc of radius 80, so its length is PI * 80
const GAUGE_ARC_LENGTH = Math.PI * 80;

@Component({
    selector: 'project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, FieldComponent, PageHeaderComponent, StageListShellComponent, ProjectTimelineComponent, ProjectFinancialDetailShellComponent, SelectModule, DatePickerModule, ButtonModule, InputTextModule, Textarea, TagModule, DialogModule, MenuModule, SkeletonModule, ReactiveFormsModule, NgIf, NgFor, RouterLink, RouterLinkActive, CurrencyPipe, DatePipe, TooltipModule]
})
export class ProjectDetailComponent implements OnChanges {
    @Input()
    project!: Project | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    architects!: Architect[] | null;
    @Input()
    projectStatuses!: ConfigurationEntry[] | null;
    @Input()
    contractStatuses!: ConfigurationEntry[] | null;
    @Input()
    projectTypes!: ConfigurationEntry[] | null;
    @Input()
    stageStatuses: ConfigurationEntry[] | null = [];
    @Input()
    installments: Installment[] | null = [];
    @Input()
    installmentsLoadFailed: boolean = false;
    @Input()
    view: ProjectDetailView = 'overview';
    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    reloadInstallmentsEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    updateProjectEvent: EventEmitter<Project> = new EventEmitter<Project>();
    @Output()
    removeProjectEvent: EventEmitter<void> = new EventEmitter<void>();

    readonly contractStore = inject(ContractStore)
    protected readonly statusSeverity = statusSeverity;

    projectDetailsForm!: FormGroup<ProjectCreateForm>;
    resolvedProjectStatusLabel: string = '';
    resolvedContractStatusLabel: string = '';
    resolvedProjectTypeLabel: string = '';
    architectName: string = '';
    clientName: string = '';
    people: ProjectPerson[] = [];

    paidValue: number = 0;
    outstandingValue: number = 0;
    paidPercent: number = 0;
    installmentsSummary: string = '';
    readonly gaugeArcLength = GAUGE_ARC_LENGTH;
    crumbs: PageCrumb[] = [];

    availableProjectStatuses: ConfigurationEntry[] = [];
    availableContractStatuses: ConfigurationEntry[] = [];

    initialContractForm!: FormGroup<ProjectContractForm>;
    initialProjectForm!: FormGroup<ProjectCreateForm>;

    formInitialized: boolean = false;

    showContractDialog: boolean = false;
    showProjectDialog: boolean = false;

    readonly actions: MenuItem[] = [
        {label: 'Delete project', icon: 'pi pi-trash', command: () => this.onDelete()}
    ];

    constructor(private formProvider: ProjectFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.formInitialized) {
            this.projectDetailsForm = this.formProvider.getProjectDetailForm();
            this.initialContractForm = cloneDeep(
                this.projectDetailsForm.get('contract') as FormGroup<ProjectContractForm>);
            this.initialProjectForm = cloneDeep(this.projectDetailsForm);
            this.formInitialized = true;
        }
        if (this.project && changes['project']) {
            this.contractStore.setContractId(this.project?.contract!.id!);
            this.resetForm();
            this.resolvePeople();
            this.crumbs = [
                {label: 'Home', route: ['/home']},
                {label: 'Projects', route: ['/projects']},
                {label: this.project.name ?? ''}
            ];
        }
        if (this.project && (changes['project'] || changes['installments'])) {
            this.resolvePayments();
        }
        if (this.project) {
            this.resolveLabels();
            this.resolveAvailableStatuses();
        }
    }

    resetForm(): void {
        this.fillFormData();
        this.initialProjectForm = cloneDeep(this.projectDetailsForm);
        this.initialContractForm = cloneDeep(
            this.projectDetailsForm.get('contract') as FormGroup<ProjectContractForm>);
        this.projectDetailsForm.markAsPristine();
    }

    fillFormData(): void {
        if (this.projectDetailsForm === undefined || !this.project) {
            return;
        }
        this.projectDetailsForm.patchValue({
            id: this.project.id,
            name: this.project.name,
            type: this.project.type,
            architectId: this.project.architect!.id,
            clientId: this.project.client!.id,
            status: this.project.status,
            note: this.project.note,
            startDate: toDateIfExists(this.project.startDate),
            endDate: toDateIfExists(this.project.endDate),
            contract: {
                id: this.project.contract!.id,
                offerValue: this.project.contract!.offerValue,
                status: this.project.contract!.status,
                signingDate: toDateIfExists(this.project.contract!.signingDate),
                startDate: toDateIfExists(this.project.contract!.startDate),
                endDate: toDateIfExists(this.project.contract!.endDate),
                deadline: toDateIfExists(this.project.contract!.deadline)
            }
        })
        this.projectDetailsForm.get('startDate')
            ?.disable();
        this.projectDetailsForm.get('endDate')
            ?.disable();
    }

    resolveLabels() {
        if (this.projectStatuses && this.projectStatuses.length > 0 && this.project?.status) {
            this.resolvedProjectStatusLabel = resolveLabel(this.project.status.toString(), this.projectStatuses!)
        }
        if (this.contractStatuses && this.contractStatuses.length > 0 && this.project?.contract?.status) {
            this.resolvedContractStatusLabel = resolveLabel(this.project.contract.status.toString(),
                this.contractStatuses!);
        }
        if (this.projectTypes && this.projectTypes.length > 0 && this.project?.type) {
            this.resolvedProjectTypeLabel = resolveLabel(this.project.type.toString(), this.projectTypes!)
        }

        this.architectName = `${this.project?.architect!.firstName} ${this.project?.architect!.lastName}`;
        let client = this.project?.client;
        this.clientName = client?.firstName ? `${client?.firstName} ${client?.lastName}` : `${client?.companyName}`;
    }

    resolvePeople() {
        let client = this.project?.client;
        let architect = this.project?.architect;
        this.people = [];
        if (architect) {
            let name = `${architect.firstName} ${architect.lastName}`;
            this.people.push({
                initials: toInitials(name), name: name, role: 'Architect', route: ['/architects', architect.id!],
                avatarClass: 'bg-brand-50 text-brand-500'
            });
        }
        if (client) {
            let name = client.firstName ? `${client.firstName} ${client.lastName}` : `${client.companyName}`;
            this.people.push({
                initials: toInitials(name), name: name, role: 'Client', route: ['/clients', client.id!],
                avatarClass: 'bg-warning-50 text-warning-700'
            });
        }
    }

    resolvePayments() {
        let installments = this.installments ?? [];
        this.paidValue = installments.filter(installment => installment.paid)
            .reduce((sum, installment) => sum + (installment.value ?? 0), 0);
        let contractValue = this.project?.contract?.offerValue ?? 0;
        this.outstandingValue = Math.max(contractValue - this.paidValue, 0);
        this.paidPercent = contractValue > 0 ? Math.min(Math.round(this.paidValue / contractValue * 100), 100) : 0;
        let paidCount = installments.filter(installment => installment.paid).length;
        this.installmentsSummary = installments.length === 0
            ? 'No installments yet'
            : `${paidCount} of ${installments.length} installments paid`;
    }

    resolveAvailableStatuses() {
        if (!this.projectStatuses?.length || !this.contractStatuses?.length) {
            return;
        }
        this.availableProjectStatuses = [];
        let currentProjectStatus = this.projectStatuses!.find(
            (status) => status.id === this.project?.status!.toString())
        this.availableProjectStatuses.push(currentProjectStatus!);
        this.projectStatuses!.filter(
            entry => {
                let index = this.project?.nextStatuses!.indexOf(ProjectStatus[entry.id as keyof typeof ProjectStatus]);
                return index != undefined && index > -1;
            })
            .forEach(entry => this.availableProjectStatuses.push(entry));

        this.availableContractStatuses = [];
        let currentContractStatus = this.contractStatuses!.find(
            status => status.id === this.project?.contract!.status!.toString())
        this.availableContractStatuses.push(currentContractStatus!);
        this.contractStatuses!.filter(
            entry => {
                let index = this.project?.contract!.nextStatuses!.indexOf(
                    ContractStatus[entry.id as keyof typeof ContractStatus])
                return index !== undefined && index > -1;
            })
            .forEach(entry => this.availableContractStatuses.push(entry));
    }

    shouldUpdateContract(): boolean {
        if (this.projectDetailsForm.get('contract')?.pristine) {
            return false;
        }
        let newContractForm = (this.projectDetailsForm.get('contract') as FormGroup<ProjectContractForm>);
        let changedValues: any[] = [];
        Object.keys(this.initialContractForm.controls)
            .forEach(key => {
                if (!(this.initialContractForm.get(key)?.value === newContractForm.get(key)?.value)) {
                    changedValues.push(key);
                }
            });
        return changedValues.length > 0;
    }

    shouldUpdateProject(): boolean {
        if (this.projectDetailsForm.pristine) {
            return false;
        }
        let changedValues: any[] = [];
        Object.keys(this.initialProjectForm.controls)
            .forEach(key => {
                if (key === "contract") {
                    return;
                }
                if (!(this.initialProjectForm.get(key)?.value === this.projectDetailsForm.get(key)?.value)) {
                    changedValues.push(key);
                }
            });
        return changedValues.length > 0;
    }

    isFieldInvalid(path: string): boolean {
        let control = this.projectDetailsForm.get(path);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    onEditContract(): void {
        this.resetForm();
        this.showContractDialog = true;
    }

    onEditProject(): void {
        this.resetForm();
        this.showProjectDialog = true;
    }

    onCancelEdit(): void {
        this.showContractDialog = false;
        this.showProjectDialog = false;
        this.resetForm();
    }

    onContractUpdate(): void {
        let contract = this.createContract();
        this.contractStore.changeStatus({contract: contract});
        this.showContractDialog = false;
    }

    onProjectUpdate(): void {
        let project = this.createProject();
        this.updateProjectEvent.emit(project);
        this.showProjectDialog = false;
    }

    createContract(): Contract {
        let contractForm: FormGroup<ProjectContractForm> = this.projectDetailsForm.get(
            'contract') as FormGroup<ProjectContractForm>;
        return {
            id: contractForm.get('id')?.value,
            offerValue: contractForm.get('offerValue')!.value,
            status: contractForm.get('status')!.value,
            signingDate: toTimeZoneString(contractForm.get('signingDate')?.value),
            startDate: toTimeZoneString(contractForm.get('startDate')?.value),
            deadline: toTimeZoneString(contractForm.get('deadline')?.value),
            endDate: toTimeZoneString(contractForm.get("endDate")?.value),
        };
    }

    createProject(): Project {
        let project: Project;
        project = {
            name: this.projectDetailsForm.value.name,
            type: this.projectDetailsForm.value.type,
            architect: {...this.project?.architect!, id: this.projectDetailsForm.value.architectId},
            note: this.projectDetailsForm.value.note!
        }
        return project;
    }

    get projectIcon(): string {
        return this.project?.type?.toString().endsWith('HOUSE') ? 'pi pi-home' : 'pi pi-building';
    }

    get gaugeOffset(): number {
        return this.gaugeArcLength * (1 - this.paidPercent / 100);
    }

    onDelete() {
        this.removeProjectEvent.emit();
    }
}

function toInitials(name: string): string {
    return name.split(' ')
        .filter(part => part.length > 0)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('');
}
