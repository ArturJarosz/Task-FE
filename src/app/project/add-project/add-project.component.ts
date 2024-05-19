import {
    Component,
    computed,
    effect,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    Signal,
    SimpleChanges
} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ClientStore} from "../../client/state";
import {ArchitectStore} from "../../architect/state";
import {ProjectStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ProjectCreate} from "../../generated/models/project-create";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Client} from "../../generated/models/client";
import {ClientFormModel} from "../../client/form/client-form-provider";
import {ProjectFormProvider} from "../form/project-form-provider";
import {Architect} from "../../generated/models/architect";
import {ArchitectFormModel} from "../../architect/model/architect";
import {cloneDeep} from "lodash";

@Component({
    selector: 'add-project',
    templateUrl: './add-project.component.html',
    styleUrls: ['./add-project.component.less']
})
export class AddProjectComponent implements OnInit, OnChanges {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new project";

    readonly clientStore = inject(ClientStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly projectStore = inject(ProjectStore);
    readonly architectStore = inject(ArchitectStore);
    $clients: Signal<Client[] | null> = this.clientStore.clients!;
    $clientsForm: Signal<ClientFormModel[]> = computed(() => {
        let clients: Client[] | null = this.$clients();
        let clientForms: ClientFormModel[] = JSON.parse(JSON.stringify(clients));
        clientForms.forEach(
            client => client.resolvedName = client.firstName ? `${client.firstName} ${client.lastName}` : client.companyName);
        return clientForms;
    });
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $architects: Signal<Architect[] | null> = this.architectStore.architects!;
    $architectsModel: Signal<ArchitectFormModel[]> = computed(() => {
        let architects: ArchitectFormModel[] = cloneDeep(this.$architects()!) as ArchitectFormModel[];
        architects.forEach(architect => architect.resolvedName = `${architect.firstName} ${architect.lastName}`);
        return architects;
    });
    addProjectForm!: FormGroup;

    constructor(private projectFormProvider: ProjectFormProvider) {
        effect(() => {
            if (this.$architects() && this.$projectTypes() && this.$clients()) {
                this.initializeValues()
            }
        });
    }

    ngOnInit(): void {
        this.clientStore.loadClients({});
        this.architectStore.loadArchitects({});
        this.configurationStore.loadConfiguration({});
        this.initializeValues();
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    private initializeValues() {
        this.setEmptyForm();
        this.setFormDefaultValues();
    }

    setFormDefaultValues() {
        if (this.existsAndNotEmpty(this.$clientsForm()) && this.existsAndNotEmpty(this.$architects()) && this.existsAndNotEmpty(this.$projectTypes()) && this.addProjectForm) {
            this.addProjectForm.patchValue({
                type: this.$projectTypes()[0]?.id,
                architectId: this.$architects()![0]?.id,
                clientId: this.$clientsForm()[0]?.id
            })
        }
    }

    private existsAndNotEmpty(collection: any[] | null): boolean {
        if (collection === null) {
            return false;
        }
        return collection && collection!.length > 0;
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
        this.addProjectForm = this.projectFormProvider.getAddProjectForm();
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
