import {FormControl, FormGroup} from "@angular/forms";

export enum ClientType {
    PRIVATE = "PRIVATE",
    CORPORATE = "CORPORATE",
}

export interface Address {
    city?: string | null,
    postCode?: string | null,
    street?: string | null,
    houseNumber?: string | null,
    flatNumber?: string | null,
}

export type AddressForm = {
    city: FormControl<string | null>,
    postCode: FormControl<string | null>,
    street: FormControl<string | null>,
    houseNumber: FormControl<string | null>,
    flatNumber: FormControl<string | null>,
}

export interface Contact {
    email?: string | null,
    telephone?: string | null,
    address?: Address | null,
}

export interface ContactForm {
    email: FormControl<string | null>,
    telephone: FormControl<string | null>,
    address: FormGroup<AddressForm>,
}

export interface Client {
    id?: number | null,
    firstName?: string | null,
    lastName?: string | null,
    companyName?: string | null,
    note?: string | null,
    clientType: ClientType,
    contact?: Contact | null
}

export interface ClientForm {
    id?: FormControl<number>,
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
    companyName: FormControl<string | null>,
    note: FormControl<string | null>,
    clientType: FormControl<ClientType>,
    contact: FormGroup<ContactForm>
}
