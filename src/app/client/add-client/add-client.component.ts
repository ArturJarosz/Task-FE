import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {
    ADDRESS,
    CITY,
    CLIENT_TYPE,
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
} from "../model/client";
import {FormGroup, Validators} from "@angular/forms";
import {ClientFormProvider} from "./client-form-provider";
import {ClientState, createClient} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationState, getClientTypeConfiguration} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType} from "../../generated/models";

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
    clientForm!: FormGroup;

    protected readonly ClientType = ClientType;

    constructor(private clientFormProvider: ClientFormProvider, private clientStore: Store<ClientState>,
                private configurationStore: Store<ConfigurationState>) {
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

    initClientGroup(): void {
        this.clientForm = this.clientFormProvider.getClientFormGroup(this.getIdFromLabel(DEFAULT_CLIENT_TYPE));
    }

    updateClientValidators(clientType: string): void {
        const firstNameControl = this.clientForm.get(FIRST_NAME);
        const lastNameControl = this.clientForm.get(LAST_NAME);
        const companyNameControl = this.clientForm.get(COMPANY_NAME);
        if (clientType === ClientType.CORPORATE.toString()) {
            firstNameControl?.clearValidators();
            lastNameControl?.clearValidators();
            companyNameControl?.setValidators(Validators.required);
        }
        if (clientType === ClientType.PRIVATE.toString()) {
            firstNameControl?.setValidators(Validators.required);
            lastNameControl?.setValidators(Validators.required);
            companyNameControl?.clearValidators();
        }
        firstNameControl?.updateValueAndValidity();
        lastNameControl?.updateValueAndValidity();
        companyNameControl?.updateValueAndValidity();
    }

    onClose(): void {
        this.notify.emit(false);
    }

    initClientTypes() {
        this.configurationStore.select(getClientTypeConfiguration)
            .subscribe({
                next: clientTypes => {
                    this.clientTypes = clientTypes;
                }
            })
    }

    onCancel() {
        this.visible = false;
        this.resetFields();
    }

    onSave() {
        this.visible = false;
        let client: Client = this.createClient();
        this.clientStore.dispatch(createClient({client: client}));
        this.reloadClients.emit();
    }

    private createClient() {
        let client: Client = {clientType: ClientType.PRIVATE, contact: {}};
        if (this.clientForm.get(CLIENT_TYPE)?.value === ClientType.PRIVATE) {
            client.clientType = ClientType.PRIVATE;
            client.firstName = this.clientForm.get(FIRST_NAME)?.value;
            client.lastName = this.clientForm.get(LAST_NAME)?.value;
        } else {
            client.clientType = ClientType.CORPORATE;
            client.companyName = this.clientForm.get(COMPANY_NAME)?.value;
        }
        client.contact = {};
        let contactForm = this.clientForm.get(CONTACT);
        if (contactForm) {
            client.contact.email = contactForm.get(EMAIL)?.value;
            client.contact.telephone = contactForm.get(TELEPHONE)?.value;
            let addressForm = contactForm.get(ADDRESS);
            client.contact.address = {city: ""};
            if (addressForm) {
                client.contact.address!.city = addressForm.get(CITY)?.value;
                client.contact.address!.postCode = addressForm.get(POST_CODE)?.value;
                client.contact.address!.street = addressForm.get(STREET)?.value;
                client.contact.address!.houseNumber = addressForm.get(HOUSE_NUMBER)?.value;
                client.contact.address!.flatNumber = addressForm.get(FLAT_NUMBER)?.value;
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
        return resolveLabel(id, this.clientTypes);
    }

}
