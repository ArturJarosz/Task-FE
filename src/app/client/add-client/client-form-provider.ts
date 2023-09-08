import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AddressForm, ClientForm, ClientType, ContactForm} from "../client";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class ClientFormProvider {
    constructor(private formBuilder: FormBuilder,) {
    }

    public getClientFormGroup(): FormGroup<ClientForm> {
        return this.formBuilder.nonNullable.group<ClientForm>({
            firstName: this.formBuilder.control<string>('', [Validators.required]),
            lastName: this.formBuilder.control<string>('', [Validators.required]),
            companyName: this.formBuilder.control<string>(''),
            note: this.formBuilder.control<string>(''),
            clientType: this.formBuilder.nonNullable.control<ClientType>(ClientType.PRIVATE, [Validators.required]),
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
            street: this.formBuilder.control<string>(''),
            houseNumber: this.formBuilder.control<string>(''),
            flatNumber: this.formBuilder.control<string>('')
        });
    }
}
