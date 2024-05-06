import {ChangeDetectionStrategy, Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ProjectContractForm, ProjectCreateForm, ProjectDetailFormProvider} from "./project-detail-form-provider";
import {cloneDeep} from 'lodash';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Architect} from "../../generated/models/architect";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry, Contract, ContractStatus, ProjectStatus} from "../../generated/models";
import {ContractStore} from "../contract-status/state/contract.store";

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
    architects!: Architect[] | null;
    @Input()
    projectStatuses!: ConfigurationEntry[] | null;
    @Input()
    contractStatuses!: ConfigurationEntry[] | null;
    @Input()
    projectTypes!: ConfigurationEntry[] | null;
    @Input()
    costCategories!: ConfigurationEntry[] | null;

    contractStore = inject(ContractStore)

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

    constructor(private formProvider: ProjectDetailFormProvider) {
    }

    ngOnInit(): void {
        this.projectDetailsForm = this.formProvider.getProjectDetailForm();
        this.initialContractForm = cloneDeep(this.projectDetailsForm.get('contract') as FormGroup<ProjectContractForm>);
        this.initialProjectForm = cloneDeep(this.projectDetailsForm);
    }

    ngOnChanges({
                    project,
                    architects,
                    projectStatuses,
                    contractStatuses,
                    projectTypes,
                    costCategories
                }: SimpleChanges): void {
        if (this.project && project) {
            this.contractStore.setContractId(this.project?.contract!.id!);
            this.resolveLabels();
            this.resolveAvailableStatuses();
            this.fillFormData();
        }
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
            contract: {
                id: this.project.contract!.id,
                offerValue: this.project.contract!.offerValue,
                status: this.project.contract!.status,
                signingDate: this.project.contract!.signingDate ? new Date(this.project.contract!.signingDate) : undefined,
                startDate: this.project.contract!.startDate ? new Date(this.project.contract!.startDate) : undefined,
                endDate: this.project.contract!.endDate ? new Date(this.project.contract!.endDate) : undefined,
                deadline: this.project.contract!.deadline ? new Date(this.project.contract!.deadline) : undefined
            }
        })
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

    resolveAvailableStatuses() {
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
        this.contractStore.changeStatus({contract: contract});
    }

    onProjectUpdate(): void {

    }

    createContract(): Contract {
        let contractForm: FormGroup<ProjectContractForm> = this.projectDetailsForm.get(
            'contract') as FormGroup<ProjectContractForm>;
        return {
            id: contractForm.get('id')?.value,
            offerValue: contractForm.get('offerValue')!.value,
            status: contractForm.get('status')!.value,
            signingDate: contractForm.get('signingDate')!.value ? contractForm.get('signingDate')!.value!.toISOString() : undefined,
            startDate: contractForm.get('startDate')!.value ? contractForm.get('startDate')!.value!.toISOString() : undefined,
            deadline: contractForm.get('deadline')!.value ? contractForm.get('deadline')!.value!.toISOString() : undefined,
            endDate: contractForm.get("endDate")!.value ? contractForm.get('endDate')!.value!.toISOString() : undefined,
        };
    }
}
