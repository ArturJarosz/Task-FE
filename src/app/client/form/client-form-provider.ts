import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Client} from "../../generated/models/client";

const DEFAULT_CLIENT_TYPE = "PRIVATE";

@Injectable({
    providedIn: 'root',
})
export class ClientFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getClientFormGroup(): FormGroup<ClientForm> {
        return this.formBuilder.nonNullable.group<ClientForm>({
            firstName: this.formBuilder.control<string>('', [Validators.required]),
            lastName: this.formBuilder.control<string>('', [Validators.required]),
            companyName: this.formBuilder.control<string>(''),
            note: this.formBuilder.control<string>(''),
            clientType: this.formBuilder.nonNullable.control<string>(DEFAULT_CLIENT_TYPE, [Validators.required]),
            contact: this.getContactFormGroup()
        })
    }

    private getContactFormGroup(): FormGroup<ContactForm> {
        return this.formBuilder.group<ContactForm>({
            email: this.formBuilder.control<string>(''),
            telephone: this.formBuilder.control<string>(''),
            address: this.getAddressFormGroup()
        });
    }

    private getAddressFormGroup(): FormGroup<AddressForm> {
        return this.formBuilder.group<AddressForm>({
            city: this.formBuilder.control<string>(''),
            postCode: this.formBuilder.control<string>(''),
            street: this.formBuilder.control<string>('')
        });
    }
}

export interface AddressForm {
    city: FormControl<string | null>,
    postCode: FormControl<string | null>,
    street: FormControl<string | null>
}

export interface ContactForm {
    email: FormControl<string | null>,
    telephone: FormControl<string | null>,
    address: FormGroup<AddressForm>,
}

export interface ClientFormModel extends Client {
    resolvedName?: string
}

export interface ClientForm {
    id?: FormControl<number>,
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
    companyName: FormControl<string | null>,
    note: FormControl<string | null>,
    clientType: FormControl<string>,
    contact: FormGroup<ContactForm>
}
