import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {getProject, loadProject, ProjectState} from "../state";
import {Store} from "@ngrx/store";
import {Project} from "../project";
import {Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {ProjectCreateForm, ProjectDetailFormProvider} from "./project-detail-form-provider";
import {
    ConfigurationState,
    getContractStatusConfiguration,
    getProjectStatusConfiguration,
    getProjectTypeConfiguration,
    loadConfiguration
} from "../../shared/configuration/state";
import {Architect} from "../../architect/model/architect";
import {ClientState, getClients, loadClients} from "../../client/state";
import {ArchitectState, getArchitects, loadArchitects} from "../../architect/state";
import {Client} from "../../client/client";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

@Component({
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.less']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
    projectId: number = 0;
    projectSubscription!: Subscription;
    project!: Project | null;
    projectDetailsForm!: FormGroup<ProjectCreateForm>;
    architectsSubscription!: Subscription;
    architects: Architect[] = [];
    clientsSubscription!: Subscription;
    clients: Client[] = [];
    projectStatusesSubscription!: Subscription;
    projectStatuses: ConfigurationEntry[] = [];
    contractStatusesSubscription!: Subscription;
    contractStatuses: ConfigurationEntry[] = [];
    projectTypesSubscription!: Subscription;
    projectTypes: ConfigurationEntry[] = [];

    resolvedProjectStatusLabel: string = '';
    resolvedContractStatusLabel: string = '';
    resolvedProjectTypeLabel: string = '';
    architectName: string = '';
    clientName: string = '';

    pageTitle: string = '';

    constructor(private route: ActivatedRoute, private projectStore: Store<ProjectState>,
                private formProvider: ProjectDetailFormProvider,
                private configurationStore: Store<ConfigurationState>,
                private clientStore: Store<ClientState>,
                private architectStore: Store<ArchitectState>) {
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('id');
        this.projectId = Number(maybeProjectId);
        this.projectStore.dispatch(loadProject({projectId: this.projectId}));
        this.projectSubscription = this.projectStore.select(getProject)
            .subscribe({
                next: project => {
                    this.project = project;
                }
            });
        this.projectDetailsForm = this.formProvider.getProjectDetailForm();

        this.clientStore.dispatch(loadClients());
        this.clientsSubscription = this.clientStore.select(getClients)
            .subscribe({
                next: clients => this.clients = clients
            });

        this.architectStore.dispatch(loadArchitects());
        this.architectsSubscription = this.architectStore.select(getArchitects)
            .subscribe({
                next: architects => this.architects = architects
            });

        this.configurationStore.dispatch(loadConfiguration());
        this.projectTypesSubscription = this.configurationStore.select(getProjectTypeConfiguration)
            .subscribe({
                next: projectTypes => this.projectTypes = projectTypes
            });
        this.projectStatusesSubscription = this.configurationStore.select(getProjectStatusConfiguration)
            .subscribe({
                next: projectStatuses => this.projectStatuses = projectStatuses
            });
        this.contractStatusesSubscription = this.configurationStore.select(getContractStatusConfiguration)
            .subscribe({
                next: contractStatuses => this.contractStatuses = contractStatuses
            });

        this.fillFormData();
        this.resolvedProjectStatusLabel = this.resolveLabel(this.projectDetailsForm.get('status')
            ?.value
            .toString(), this.projectStatuses);
        this.resolvedContractStatusLabel = this.resolveLabel(this.projectDetailsForm.get('contract')
            ?.get('status')
            ?.value
            .toString(), this.contractStatuses);
        this.resolvedProjectTypeLabel = this.resolveLabel(this.projectDetailsForm.get('type')
            ?.value
            .toString(), this.projectTypes)
        this.architectName = `${this.project?.architect.firstName} ${this.project?.architect.lastName}`;
        let client = this.project?.client;
        this.clientName = client?.firstName ? `${client?.firstName} ${client?.lastName}` : `${client?.companyName}`;
        this.pageTitle = `${this.project?.name} / ${this.resolvedProjectTypeLabel}`;
    }

    fillFormData(): void {
        this.projectDetailsForm.patchValue({
            id: this.project?.id,
            name: this.project?.name,
            type: this.project?.type,
            architectId: this.project?.architect.id,
            clientId: this.project?.client.id,
            status: this.project?.status,
            contract: {
                id: this.project?.contract.id,
                offerValue: this.project?.contract.offerValue,
                status: this.project?.contract.status,
                signingDate: this.project?.contract.signingDate,
                startDate: this.project?.contract.startDate,
                endDate: this.project?.contract.endDate,
                deadline: this.project?.contract.deadline
            }
        })
    }

    resolveLabel(id: string | undefined, entries: ConfigurationEntry[]): string {
        if (!id) {
            return '';
        }
        let maybeLabel = entries.find(element => element.id === id)?.label;
        return maybeLabel ? maybeLabel : id;
    }

    ngOnDestroy(): void {
        this.projectSubscription.unsubscribe();
        this.architectsSubscription.unsubscribe();
        this.clientsSubscription.unsubscribe();
        this.projectTypesSubscription.unsubscribe();
        this.contractStatusesSubscription.unsubscribe();
        this.projectStatusesSubscription.unsubscribe();
    }
}
