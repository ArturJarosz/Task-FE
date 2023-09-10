import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {Client, ClientType} from "../client";
import {ClientRestService} from "../service/client-rest.service";
import {FormGroup, Validators} from "@angular/forms";
import {ClientFormProvider} from "./client-form-provider";
import {HttpStatusCode} from "@angular/common/http";

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

    constructor(private clientService: ClientRestService, private clientFormProvider: ClientFormProvider) {
        this.initClientGroup();
    }

    initClientGroup(): void {
        this.clientForm = this.clientFormProvider.getClientFormGroup();
    }

    updateClientValidators(clientType: ClientType): void {
        const firstNameControl = this.clientForm.get('firstName');
        const lastNameControl = this.clientForm.get('lastName');
        const companyNameControl = this.clientForm.get('companyName');
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
        this.clientForm.get('clientType')
            ?.valueChanges
            .subscribe(clientType => {
                console.log(clientType);
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
                        if (response.status === HttpStatusCode.Created) {
                        }
                    },
                    error: error => console.log(error),
                }
            );
    }

    private createClient() {
        let client: Client;
        if (this.clientForm.get('clientType')?.value === ClientType.PRIVATE) {
            client = {
                clientType: ClientType.PRIVATE,
                firstName: this.clientForm.get('firstName')?.value,
                lastName: this.clientForm.get('lastName')?.value
            }
        } else {
            client = {
                clientType: ClientType.CORPORATE,
                companyName: this.clientForm.get('companyName')?.value
            }
        }
        client.contact = {};
        let contactForm = this.clientForm.get('contact');
        if (contactForm) {
            client.contact.email = contactForm.get('email')?.value;
            client.contact.telephone = contactForm.get('telephone')?.value;
            let addressForm = contactForm.get('address');
            client.contact.address = {};
            if (addressForm) {
                client.contact.address.city = addressForm.get('city')?.value;
                client.contact.address.postCode = addressForm.get('postCode')?.value;
                client.contact.address.street = addressForm.get('street')?.value;
                client.contact.address.houseNumber = addressForm.get('houseNumber')?.value;
                client.contact.address.flatNumber = addressForm.get('flatNumber')?.value;
            }

        }
        client.note = this.clientForm.get('note')?.value;
        return client;
    }

    isSaveEnabled(): boolean {
        return this.clientForm.valid;
    }

    resetFields() {
        this.clientForm = this.clientFormProvider.getClientFormGroup();
    }

}
