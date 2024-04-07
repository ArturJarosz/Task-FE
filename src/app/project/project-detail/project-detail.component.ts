import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from '@angular/core';
import {Store} from "@ngrx/store";
import {ContractStatus, Project, ProjectContract, ProjectStatus} from "../project";
import {FormGroup} from "@angular/forms";
import {ProjectContractForm, ProjectCreateForm, ProjectDetailFormProvider} from "./project-detail-form-provider";
import {ConfigurationState, loadConfiguration} from "../../shared/configuration/state";
import {Architect} from "../../architect/model/architect";
import {ArchitectState, loadArchitects} from "../../architect/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {cloneDeep} from 'lodash';
import {ContractStatusService} from "../contract-status/contract-status.service";
import {Observable, of} from "rxjs";

@Component({
    selector: 'project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailComponent implements OnInit, OnChanges {
    @Input()
    project!: Project | null;
    @Input()
    architects: Architect[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    contractStatuses: ConfigurationEntry[] | null = [];
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];

    projectDetailsForm!: FormGroup<ProjectCreateForm>;
    resolvedProjectStatusLabel: string = '';
    resolvedContractStatusLabel: string = '';
    resolvedProjectTypeLabel: string = '';
    architectName: string = '';
    clientName: string = '';

    availableProjectStatuses: ConfigurationEntry[] = [];
    availableContractStatuses: ConfigurationEntry[] = [];

    initialContractForm!: FormGroup<ProjectContractForm>;
    initialProjectForm!: FormGroup<ProjectCreateForm>;

    constructor(private formProvider: ProjectDetailFormProvider,
                private configurationStore: Store<ConfigurationState>,
                private architectStore: Store<ArchitectState>,
                private contractService: ContractStatusService, private cd: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.architectStore.dispatch(loadArchitects());
        this.configurationStore.dispatch(loadConfiguration());

        this.projectDetailsForm = this.formProvider.getProjectDetailForm();
        this.fillFormData();
        // TODO: spytac Tomka czy da rade to jakos inaczej ogarnac, niz kopiowac przed deep copy i porownywac
        this.initialContractForm = cloneDeep(this.projectDetailsForm.get('contract') as FormGroup<ProjectContractForm>);
        this.initialProjectForm = cloneDeep(this.projectDetailsForm);
        this.resolveLabels();
        this.resolveAvailableStatuses();

    }

    fillFormData(): void {
        if (this.projectDetailsForm === undefined) {
            return;
        }
        if (!this.project) {
            return;
        }

        this.projectDetailsForm.patchValue({
            id: this.project.id,
            name: this.project.name,
            type: this.project.type,
            architectId: this.project.architect.id,
            clientId: this.project.client.id,
            status: this.project.status,
            contract: {
                id: this.project.contract.id,
                offerValue: this.project.contract.offerValue,
                status: this.project.contract.status,
                signingDate: this.project.contract.signingDate ? new Date(
                    this.project.contract.signingDate) : undefined,
                startDate: this.project.contract.startDate ? new Date(this.project.contract.startDate) : undefined,
                endDate: this.project.contract.endDate ? new Date(this.project.contract.endDate) : undefined,
                deadline: this.project.contract.deadline ? new Date(this.project.contract.deadline) : undefined
            }
        })
    }

    patchValueIfExists() {

    }

    resolveLabels() {
        // TODO: spytać Tomka jak lepiej to ograć i jak rozwiązać brak danych przy przeloadowaniu strony
        if (this.projectStatuses && this.projectStatuses.length > 0 && this.projectDetailsForm.get('status')?.value) {
            this.resolvedProjectStatusLabel = this.resolveLabel(this.projectDetailsForm.get('status')
                ?.value
                .toString(), this.projectStatuses!);
        }
        if (this.contractStatuses && this.contractStatuses.length > 0 && this.projectDetailsForm.get(
            ['contract', 'status'])?.value) {
            this.resolvedContractStatusLabel = this.resolveLabel(this.projectDetailsForm.get('contract')
                ?.get('status')
                ?.value
                .toString(), this.contractStatuses!);
        }
        if (this.projectTypes && this.projectTypes.length > 0 && this.projectDetailsForm.get('type')?.value) {
            this.resolvedProjectTypeLabel = this.resolveLabel(this.projectDetailsForm.get('type')
                ?.value
                .toString(), this.projectTypes!)
        }
        this.architectName = `${this.project?.architect.firstName} ${this.project?.architect.lastName}`;
        let client = this.project?.client;
        this.clientName = client?.firstName ? `${client?.firstName} ${client?.lastName}` : `${client?.companyName}`;
    }

    resolveLabel(id: string | undefined, entries: ConfigurationEntry[]): string {
        if (!id) {
            return '';
        }
        let maybeLabel = entries.find(element => element.id === id)?.label;
        return maybeLabel ? maybeLabel : id;
    }

    resolveAvailableStatuses() {
        this.availableProjectStatuses = [];
        let currentProjectStatus = this.projectStatuses?.find(status => status.id === this.project?.status.toString())
        this.availableProjectStatuses.push(currentProjectStatus!);
        this.projectStatuses!.filter(
            entry => {
                let index = this.project?.nextStatuses.indexOf(ProjectStatus[entry.id as keyof typeof ProjectStatus]);
                return index != undefined && index > -1;
            })
            .forEach(entry => this.availableProjectStatuses.push(entry));

        this.availableContractStatuses = [];
        let currentContractStatus = this.contractStatuses?.find(
            status => status.id === this.project?.contract.status.toString())
        this.availableContractStatuses.push(currentContractStatus!);
        this.contractStatuses!.filter(
            entry => {
                let index = this.project?.contract.nextStatuses!.indexOf(
                    ContractStatus[entry.id as keyof typeof ContractStatus])
                return index !== undefined && index > -1;
            })
            .forEach(entry => this.availableContractStatuses.push(entry));
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.fillFormData();
        // TODO: spytac Tomka...
        if (this.projectDetailsForm === undefined) {
            return;
        }
        this.initialContractForm = cloneDeep(this.projectDetailsForm.get('contract') as FormGroup<ProjectContractForm>);
        this.initialProjectForm = cloneDeep(this.projectDetailsForm);
        this.resolveLabels();
        this.resolveAvailableStatuses();
        this.cd.detectChanges();
    }

    shouldUpdateContract(): boolean {
        if (this.projectDetailsForm.get('contract')?.untouched) {
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
        if (this.projectDetailsForm.untouched) {
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

    onContractUpdate(): void {
        let contract = this.createContract();
        this.contractService.resolveContractStatusChange(contract, this.initialContractForm.get('status')?.value!);
        this.cd.detectChanges();
    }

    onProjectUpdate(): void {

    }

    createContract(): ProjectContract {
        let contract: ProjectContract;
        let contractForm: FormGroup<ProjectContractForm> = this.projectDetailsForm.get(
            'contract') as FormGroup<ProjectContractForm>;
        contract = {
            id: contractForm.get('id')?.value,
            offerValue: contractForm.get('offerValue')!.value,
            status: contractForm.get('status')!.value,
            signingDate: contractForm.get('signingDate')!.value,
            startDate: contractForm.get('startDate')!.value,
            deadline: contractForm.get('deadline')!.value,
            endDate: contractForm.get("endDate")!.value
        }
        return contract;
    }
}
