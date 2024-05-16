import {Component, EventEmitter, inject, Injectable, Input, OnInit, Output, Signal} from '@angular/core';
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
import {ClientFormProvider} from "../form/client-form-provider";
import {ClientStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Client, ClientType, ConfigurationEntry} from "../../generated/models";

@Injectable({
    providedIn: 'root',
})
@Component({
    selector: 'add-client',
    templateUrl: './add-client.component.html',
    styleUrls: ['./add-client.component.less'],
})
export class AddClientComponent implements OnInit {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly clientStore = inject(ClientStore);
    readonly configurationStore = inject(ConfigurationStore);
    $clientTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.clientTypes;
    clientForm!: FormGroup;

    protected readonly ClientType = ClientType;

    constructor(private clientFormProvider: ClientFormProvider) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.initClientGroup();
        this.clientForm.get(CLIENT_TYPE)
            ?.valueChanges!
            .subscribe(clientType => {
                this.updateClientValidators(clientType.id);
            })
    }

    initClientGroup(): void {
        this.clientForm = this.clientFormProvider.getClientFormGroup();
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

    onCancel() {
        this.visible = false;
        this.resetFields();
    }

    onSave() {
        this.visible = false;
        let client: Client = this.createClient();
        this.clientStore.createClient({client: client});
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
        this.clientForm = this.clientFormProvider.getClientFormGroup();
    }

}
