import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {
    Client,
    FIRST_NAME,
    ClientType,
    LAST_NAME,
    COMPANY_NAME,
    CLIENT_TYPE,
    CONTACT,
    EMAIL,
    TELEPHONE, ADDRESS, CITY, POST_CODE, STREET, HOUSE_NUMBER, FLAT_NUMBER, NOTE
} from "../client";
import {ClientRestService} from "../service/client-rest.service";
import {FormGroup, Validators} from "@angular/forms";
import {ClientFormProvider} from "./client-form-provider";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

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

    clientTypes!: String[];
    clientForm!: FormGroup;

    protected readonly ClientType = ClientType;

    constructor(private clientService: ClientRestService, private clientFormProvider: ClientFormProvider, private messageService: MessageService) {
        this.initClientGroup();
    }

    initClientGroup(): void {
        this.clientForm = this.clientFormProvider.getClientFormGroup();
    }

    updateClientValidators(clientType: ClientType): void {
        const firstNameControl = this.clientForm.get(FIRST_NAME);
        const lastNameControl = this.clientForm.get(LAST_NAME);
        const companyNameControl = this.clientForm.get(COMPANY_NAME);
        if (clientType === ClientType.CORPORATE) {
            firstNameControl?.clearValidators();
            lastNameControl?.clearValidators();
            companyNameControl?.setValidators(Validators.required);
        }
        if (clientType === ClientType.PRIVATE) {
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
        this.clientForm.get(CLIENT_TYPE)
            ?.valueChanges
            .subscribe(clientType => {
                this.updateClientValidators(clientType);
            })
    }

    onClose(): void {
        this.notify.emit(false);
    }

    initClientTypes() {
        this.clientTypes = Object.values(ClientType)
            .filter(value => true) as string[];
    }

    onCancel() {
        this.visible = false;
        this.resetFields();
    }

    onSave() {
        this.visible = false;
        let client: Client;
        client = this.createClient();
        this.clientService.createClient(client)
            .subscribe({
                    next: response => {
                        let clientName = client.clientType === ClientType.PRIVATE ? `${client.firstName} ${client.lastName}` : client.companyName;
                        this.messageService.add({
                            severity: MessageSeverity.SUCCESS,
                            summary: "Client created.",
                            detail: `Client ${clientName} has been successfully created.`

                        })
                    }
                }
            );
    }

    private createClient() {
        let client: Client;
        if (this.clientForm.get(CLIENT_TYPE)?.value === ClientType.PRIVATE) {
            client = {
                clientType: ClientType.PRIVATE,
                firstName: this.clientForm.get(FIRST_NAME)?.value,
                lastName: this.clientForm.get(LAST_NAME)?.value
            }
        } else {
            client = {
                clientType: ClientType.CORPORATE,
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
        this.clientForm = this.clientFormProvider.getClientFormGroup();
    }

}
