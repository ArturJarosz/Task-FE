import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Client, ClientType, ConfigurationEntry, Contact} from "../../generated/models";
import {FormGroup} from "@angular/forms";
import {ClientForm, ClientFormProvider} from "../form/client-form-provider";
import {cloneDeep} from "lodash";

@Component({
    selector: 'client-detail',
    templateUrl: './client-detail.component.html',
    styleUrls: ['./client-detail.component.less']
})
export class ClientDetailComponent implements OnInit, OnChanges {
    @Input()
    client!: Client | null;
    @Input()
    clientTypes!: ConfigurationEntry[] | null;
    @Output()
    updateClientEvent: EventEmitter<Client> = new EventEmitter<Client>();
    clientDetailsForm!: FormGroup<ClientForm>;
    clientName: string | undefined;
    combinedStreetWithNumbers!: string;

    initialClientForm!: FormGroup<ClientForm>;

    protected readonly ClientType = ClientType;

    constructor(private formProvider: ClientFormProvider) {
    }

    ngOnInit(): void {
        this.resolveCombinedStreet();
        this.clientDetailsForm = this.formProvider.getClientFormGroup();
        this.fillFormData();
    }

    resolveCombinedStreet() {
        if (!this.client?.contact || !this.client.contact?.address || !this.client?.contact) {
            this.combinedStreetWithNumbers = "";
        } else {
            this.combinedStreetWithNumbers = `${this.client?.contact?.address?.street} ${this.client?.contact?.address?.houseNumber}`;
            if (this.client?.contact.address.flatNumber) {
                this.combinedStreetWithNumbers = this.combinedStreetWithNumbers + `/${this.client?.contact?.address?.flatNumber}`;
            }
        }
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (this.client) {
            this.clientName = this.client?.firstName ? `${this.client?.firstName} ${this.client?.lastName}` : `${this.client?.companyName}`;
            this.fillFormData();
            this.initialClientForm = cloneDeep(this.clientDetailsForm);
        }
    }

    private fillFormData(): void {
        if (!this.client || !this.clientDetailsForm) {
            return;
        }
        this.clientDetailsForm.patchValue({
            clientType: this.client.clientType,
            firstName: this.client.firstName,
            lastName: this.client.lastName,
            companyName: this.client.companyName,
            note: this.client.note,
            contact: {
                address: {
                    city: this.client.contact.address?.city,
                    street: this.client.contact.address?.street,
                    postCode: this.client.contact.address?.postCode,
                },
                email: this.client.contact.email,
                telephone: this.client.contact.telephone
            }
        });
    }

    isFormChanged(): boolean {
        if (this.clientDetailsForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialClientForm.value) !== JSON.stringify(this.clientDetailsForm.value);
    }

    onSave(): void {
        let client: Client;
        client = {
            clientType: this.clientDetailsForm.value.clientType as ClientType,
            companyName: this.clientDetailsForm.value.companyName!,
            firstName: this.clientDetailsForm.value.firstName!,
            lastName: this.clientDetailsForm.value.lastName!,
            note: this.clientDetailsForm.value.note!,
            contact: {
                telephone: this.clientDetailsForm.value.contact!.telephone,
                email: this.clientDetailsForm.value.contact!.email,
                address: {
                    city: this.clientDetailsForm.value.contact!.address!.city,
                    street: this.clientDetailsForm.value.contact!.address?.street,
                    postCode: this.clientDetailsForm.value.contact!.address?.postCode
                }
            } as Contact
        }
        this.updateClientEvent.emit(client);
    }
}
