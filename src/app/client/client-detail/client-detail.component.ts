import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Client, ClientType, ConfigurationEntry, Contact} from "../../generated/models";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ClientForm, ClientFormProvider} from "../form/client-form-provider";
import {ClientDto} from "../model/client";
import {ClientFormFieldsComponent} from "../client-form-fields/client-form-fields.component";
import {EntityProjectsComponent, FieldComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {resolveLabel} from "../../shared/utils/label-utils";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";
import {CurrencyPipe, NgIf} from "@angular/common";

@Component({
    selector: 'client-detail',
    templateUrl: './client-detail.component.html',
    styleUrls: ['./client-detail.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, FieldComponent, EntityProjectsComponent, ClientFormFieldsComponent, ButtonModule, DialogModule,
        MenuModule, TooltipModule, ReactiveFormsModule, NgIf, CurrencyPipe]
})
export class ClientDetailComponent implements OnChanges {
    @Input()
    client!: Client;
    @Input()
    clientTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectsSummary: EntityProjectsSummary | null = null;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Output()
    updateClientEvent: EventEmitter<Client> = new EventEmitter<Client>();
    @Output()
    deleteClientEvent: EventEmitter<ClientDto> = new EventEmitter<ClientDto>();

    clientDetailsForm: FormGroup<ClientForm>;
    initialFormValue: string = '';
    showEditDialog: boolean = false;

    clientName: string = '';
    initials: string = '';
    typeLabel: string = '';
    projects: number = 0;
    activeProjects: number = 0;
    projectsValue: number = 0;
    crumbs: PageCrumb[] = [];

    readonly actions: MenuItem[] = [
        {label: 'Delete client', icon: 'pi pi-trash', command: () => this.onDelete()}
    ];

    protected readonly ClientType = ClientType;

    constructor(private formProvider: ClientFormProvider) {
        this.clientDetailsForm = this.formProvider.getClientFormGroup();
    }

    ngOnChanges(changes: SimpleChanges): void {
        let client = this.client;
        this.clientName = client.clientType === ClientType.CORPORATE
            ? client.companyName ?? ''
            : `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
        this.initials = client.clientType === ClientType.CORPORATE
            ? (client.companyName?.charAt(0) ?? '?').toUpperCase()
            : `${client.firstName?.charAt(0) ?? ''}${client.lastName?.charAt(0) ?? ''}`.toUpperCase() || '?';
        this.typeLabel = resolveLabel(client.clientType, this.clientTypes);
        // The counts and the value come from the backend, which decides which project statuses are active
        this.projects = client.numberOfProjects ?? 0;
        this.activeProjects = client.numberOfActiveProjects ?? 0;
        this.projectsValue = client.projectsValue ?? 0;
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Clients', route: ['/clients']},
            {label: this.clientName},
        ];
        if (changes['client']) {
            this.resetForm();
        }
    }

    get address(): string {
        let address = this.client.contact?.address;
        let cityLine = [address?.postCode, address?.city].filter(part => !!part).join(' ');
        return [address?.street, cityLine].filter(part => !!part).join(', ');
    }

    resetForm(): void {
        this.clientDetailsForm = this.formProvider.getClientFormGroup();
        this.clientDetailsForm.patchValue({
            clientType: this.client.clientType,
            firstName: this.client.firstName,
            lastName: this.client.lastName,
            companyName: this.client.companyName,
            note: this.client.note,
            contact: {
                address: {
                    city: this.client.contact?.address?.city,
                    street: this.client.contact?.address?.street,
                    postCode: this.client.contact?.address?.postCode,
                },
                email: this.client.contact?.email,
                telephone: this.client.contact?.telephone
            }
        });
        this.initialFormValue = JSON.stringify(this.clientDetailsForm.getRawValue());
    }

    isSaveEnabled(): boolean {
        return this.clientDetailsForm.valid && JSON.stringify(this.clientDetailsForm.getRawValue()) !== this.initialFormValue;
    }

    onEdit(): void {
        this.resetForm();
        this.showEditDialog = true;
    }

    onCancelEdit(): void {
        this.showEditDialog = false;
        this.resetForm();
    }

    onSave(): void {
        let value = this.clientDetailsForm.getRawValue();
        let client: Client = {
            clientType: value.clientType as ClientType,
            companyName: value.companyName!,
            firstName: value.firstName!,
            lastName: value.lastName!,
            note: value.note!,
            contact: {
                telephone: value.contact.telephone,
                email: value.contact.email,
                address: {
                    city: value.contact.address.city,
                    street: value.contact.address.street,
                    postCode: value.contact.address.postCode
                }
            } as Contact
        };
        this.showEditDialog = false;
        this.updateClientEvent.emit(client);
    }

    onDelete(): void {
        this.deleteClientEvent.emit({id: this.client.id!, name: this.clientName});
    }
}
