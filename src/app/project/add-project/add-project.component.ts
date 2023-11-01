import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Client} from "../../client/client";
import {Architect} from "../../architect/model/architect";
import {FormGroup} from "@angular/forms";
import {AddProjectFormProvider} from "./add-project-form-provider.service";
import {ClientState, getClients, loadClients} from "../../client/state";
import {Store} from "@ngrx/store";
import {ArchitectState, getArchitects, loadArchitects} from "../../architect/state";
import {createProject, ProjectState} from "../state";
import {Subscription} from "rxjs";
import {ConfigurationState, getProjectTypeConfiguration, loadConfiguration} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {ProjectCreate} from "../project";

@Component({
    selector: 'app-add-project',
    templateUrl: './add-project.component.html',
    styleUrls: ['./add-project.component.less']
})
export class AddProjectComponent implements OnInit, OnDestroy {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new project";

    clientsSubscription!: Subscription;
    clients: Client[] = [];
    architectsSubscription!: Subscription;
    architects: Architect[] = [];
    projectTypesSubscription!: Subscription;
    projectTypes: ConfigurationEntry[] = [];
    addProjectForm!: FormGroup;


    constructor(private addProjectFormProvider: AddProjectFormProvider, private clientStore: Store<ClientState>,
                private architectStore: Store<ArchitectState>, private projectStore: Store<ProjectState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.initializeValues();
        this.initializeValidators();
    }

    private initializeValues() {
        this.clientStore.dispatch(loadClients());
        this.clientsSubscription = this.clientStore.select(getClients)
            .subscribe({
                next: clients => {
                    this.clients = JSON.parse(JSON.stringify(clients));
                    this.clients.forEach(
                        client => client.resolvedName = client.firstName ? `${client.firstName} ${client.lastName}` : client.companyName)
                }
            });
        this.architectStore.dispatch(loadArchitects());
        this.architectsSubscription = this.architectStore.select(getArchitects)
            .subscribe({
                next: architects => {
                    this.architects = JSON.parse(JSON.stringify(architects));
                    this.architects.forEach(
                        architect => architect.resolvedName = `${architect.firstName} ${architect.lastName}`)
                }
            })
        this.configurationStore.dispatch(loadConfiguration());
        this.projectTypesSubscription = this.configurationStore.select(getProjectTypeConfiguration)
            .subscribe({
                next: projectTypes => this.projectTypes = projectTypes
            })

        this.addProjectForm = this.addProjectFormProvider.getAddProjectForm();
    }

    initializeValidators(): void {

    }

    ngOnDestroy(): void {
        this.clientsSubscription.unsubscribe();
        this.architectsSubscription.unsubscribe();
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onSave(): void {
        this.visible = false;
        let project: ProjectCreate = this.createProject();
        this.projectStore.dispatch(createProject({projectCreate: project}));
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
    }

    isSaveEnabled(): boolean {
        return this.addProjectForm.valid;
    }

    resetFields(): void {
        this.addProjectForm = this.addProjectFormProvider.getAddProjectForm();
    }

    createProject(): ProjectCreate {
        let project: ProjectCreate;
        project = {
            name: this.addProjectForm.get('name')?.value,
            type: this.addProjectForm.get('type')?.value,
            clientId: this.addProjectForm.get('clientId')?.value,
            architectId: this.addProjectForm.get('architectId')?.value,
            offerValue: this.addProjectForm.get('offerValue')?.value,
        };
        return project;
    }
}
