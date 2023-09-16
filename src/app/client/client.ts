import {FormControl, FormGroup} from "@angular/forms";

export const FIRST_NAME: string = "firstName";
export const LAST_NAME: string = "lastName";
export const COMPANY_NAME: string = "companyName";
export const CLIENT_TYPE: string = "clientType";
export const CONTACT: string = "contact";
export const EMAIL: string = "email";
export const TELEPHONE: string = "telephone";
export const ADDRESS: string = "address";
export const CITY: string = "city";
export const POST_CODE: string = "postCode";
export const STREET: string = "street";
export const HOUSE_NUMBER: string = "houseNumber";
export const FLAT_NUMBER:string = "flatNumber";
export const NOTE:string = "note";

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

export interface AddressForm {
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
