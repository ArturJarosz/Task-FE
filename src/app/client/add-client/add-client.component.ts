import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {
    ADDRESS,
    CITY,
    Client,
    CLIENT_TYPE,
    ClientType,
    COMPANY_NAME,
    CONTACT,
    EMAIL,
    FIRST_NAME,
    FLAT_NUMBER,
    HOUSE_NUMBER,
    LAST_NAME,
    NOTE,
    POST_CODE,
    STREET,
    TELEPHONE
} from "../client";
import {FormGroup, Validators} from "@angular/forms";
import {ClientFormProvider} from "./client-form-provider";
import {ClientState, createClient} from "../state";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getClientTypeConfiguration
} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

const DEFAULT_CLIENT_TYPE = ClientType.PRIVATE.toString();

@Injectable({
    providedIn: 'root',
})
@Component({
    selector: 'app-add-client',
    templateUrl: './add-client.component.html',
    styleUrls: ['./add-client.component.less'],
})
export class AddClientComponent implements OnInit {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()
    reloadClients = new EventEmitter<void>();

    clientTypes: ConfigurationEntry[] = [];
    clientTypesLabels: string[] = [];
    clientForm!: FormGroup;
    privateClientLabel: string = "";
    corporateClientLabel: string = "";

    protected readonly ClientType = ClientType;

    constructor(private clientFormProvider: ClientFormProvider, private clientStore: Store<ClientState>, private configurationStore: Store<ConfigurationState>) {
    }

    initClientGroup(): void {
        this.clientForm = this.clientFormProvider.getClientFormGroup(this.getIdFromLabel(DEFAULT_CLIENT_TYPE));
    }

    updateClientValidators(clientType: string): void {
        const firstNameControl = this.clientForm.get(FIRST_NAME);
        const lastNameControl = this.clientForm.get(LAST_NAME);
        const companyNameControl = this.clientForm.get(COMPANY_NAME);
        if (clientType === this.corporateClientLabel) {
            firstNameControl?.clearValidators();
            lastNameControl?.clearValidators();
            companyNameControl?.setValidators(Validators.required);
        }
        if (clientType === this.privateClientLabel) {
            firstNameControl?.setValidators(Validators.required);
            lastNameControl?.setValidators(Validators.required);
            companyNameControl?.clearValidators();
        }
        firstNameControl?.updateValueAndValidity();
        lastNameControl?.updateValueAndValidity();
        companyNameControl?.updateValueAndValidity();
    }

    ngOnInit(): void {
        this.initClientTypes();
        this.initClientGroup();
        this.clientForm.get(CLIENT_TYPE)
            ?.valueChanges
            .subscribe(clientType => {
                this.updateClientValidators(clientType.id);
            })
    }

    onClose(): void {
        this.notify.emit(false);
    }

    initClientTypes() {
        this.configurationStore.select(getClientTypeConfiguration)
            .subscribe({
                next: clientTypes => {
                    this.clientTypes = clientTypes;
                    this.clientTypesLabels = clientTypes.map(entry => entry.label)
                }
            })
        this.privateClientLabel = this.getIdFromLabel(ClientType.PRIVATE.toString());
        this.corporateClientLabel = this.getIdFromLabel(ClientType.CORPORATE.toString());
    }

    onCancel() {
        this.visible = false;
        this.resetFields();
    }

    onSave() {
        this.visible = false;
        let client: Client;
        client = this.createClient();
        this.clientStore.dispatch(createClient({client: client}));
        this.reloadClients.emit();
    }

    private createClient() {
        let client: Client;
        if (this.clientForm.get(CLIENT_TYPE)?.value === this.privateClientLabel) {
            client = {
                clientType: ClientType.PRIVATE.toString(),
                firstName: this.clientForm.get(FIRST_NAME)?.value,
                lastName: this.clientForm.get(LAST_NAME)?.value
            }
        } else {
            client = {
                clientType: ClientType.CORPORATE.toString(),
                companyName: this.clientForm.get(COMPANY_NAME)?.value
            }
        }
        client.contact = {};
        let contactForm = this.clientForm.get(CONTACT);
        if (contactForm) {
            client.contact.email = contactForm.get(EMAIL)?.value;
            client.contact.telephone = contactForm.get(TELEPHONE)?.value;
            let addressForm = contactForm.get(ADDRESS);
            client.contact.address = {};
            if (addressForm) {
                client.contact.address.city = addressForm.get(CITY)?.value;
                client.contact.address.postCode = addressForm.get(POST_CODE)?.value;
                client.contact.address.street = addressForm.get(STREET)?.value;
                client.contact.address.houseNumber = addressForm.get(HOUSE_NUMBER)?.value;
                client.contact.address.flatNumber = addressForm.get(FLAT_NUMBER)?.value;
            }

        }
        client.note = this.clientForm.get(NOTE)?.value;
        return client;
    }

    isSaveEnabled(): boolean {
        return this.clientForm.valid;
    }

    resetFields() {
        this.clientForm = this.clientFormProvider.getClientFormGroup(this.getIdFromLabel(DEFAULT_CLIENT_TYPE));
    }

    getIdFromLabel(id: string): string {
        let maybeLabel = this.clientTypes.find(element => element.id === id)?.label;
        return maybeLabel ? maybeLabel : id;
    }

}
