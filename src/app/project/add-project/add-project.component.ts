import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {AddProjectFormProvider} from "./add-project-form-provider.service";
import {ClientState, getClients, loadClients} from "../../client/state";
import {Store} from "@ngrx/store";
import {ArchitectState, getArchitects, loadArchitects} from "../../architect/state";
import {ProjectStore} from "../state";
import {Subscription} from "rxjs";
import {ConfigurationState, getProjectTypeConfiguration, loadConfiguration} from "../../shared/configuration/state";
import {ArchitectFormModel} from "../../architect/model/architect";
import {ClientFormModel} from "../../client/model/client";
import {ProjectCreate} from "../../generated/models/project-create";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'add-project',
    templateUrl: './add-project.component.html',
    styleUrls: ['./add-project.component.less']
})
export class AddProjectComponent implements OnInit, OnDestroy {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new project";

    clientsSubscription$!: Subscription;
    clients: ClientFormModel[] = [];
    architectsSubscription$!: Subscription;
    architects: ArchitectFormModel[] = [];
    projectTypesSubscription$!: Subscription;
    projectTypes: ConfigurationEntry[] = [];
    addProjectForm!: FormGroup;

    readonly projectStore = inject(ProjectStore);


    constructor(private addProjectFormProvider: AddProjectFormProvider, private clientStore: Store<ClientState>,
                private architectStore: Store<ArchitectState>, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.initializeValues();
    }

    private initializeValues() {
        this.clientStore.dispatch(loadClients());
        this.clientsSubscription$ = this.clientStore.select(getClients)
            .subscribe({
                next: clients => {
                    this.clients = JSON.parse(JSON.stringify(clients));
                    this.clients.forEach(
                        client => client.resolvedName = client.firstName ? `${client.firstName} ${client.lastName}` : client.companyName);
                    this.setFormDefaultValues();
                }
            });
        this.architectStore.dispatch(loadArchitects());
        this.architectsSubscription$ = this.architectStore.select(getArchitects)
            .subscribe({
                next: architects => {
                    this.architects = JSON.parse(JSON.stringify(architects));
                    this.architects.forEach(
                        architect => architect.resolvedName = `${architect.firstName} ${architect.lastName}`);
                    this.setFormDefaultValues();
                }
            })
        this.configurationStore.dispatch(loadConfiguration());
        this.projectTypesSubscription$ = this.configurationStore.select(getProjectTypeConfiguration)
            .subscribe({
                next: projectTypes => {
                    this.projectTypes = projectTypes;
                    this.setFormDefaultValues();
                }
            })

        this.setEmptyForm();
        this.setFormDefaultValues();
    }

    setFormDefaultValues() {
        if (this.clients && this.clients.length > 0 && this.architects && this.architects.length > 0 && this.projectTypes && this.projectTypes.length > 0 && this.addProjectForm) {
            this.addProjectForm.patchValue({
                type: this.projectTypes[0]?.id,
                architectId: this.architects[0]?.id,
                clientId: this.clients[0]?.id
            })
        }
    }


    ngOnDestroy(): void {
        this.clientsSubscription$.unsubscribe();
        this.architectsSubscription$.unsubscribe();
        this.projectTypesSubscription$.unsubscribe();
    }

    onCancel(): void {
        this.visible = false;
        this.setEmptyForm();
    }

    onSave(): void {
        this.visible = false;
        let project: ProjectCreate = this.createProject();
        this.projectStore.createProject({projectCreate: project});
    }

    onClose(): void {
        this.notify.emit(false);
        this.setEmptyForm();
    }

    isSaveEnabled(): boolean {
        return this.addProjectForm.valid;
    }

    setEmptyForm(): void {
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
