export enum ClientType {
    PRIVATE = "PRIVATE",
    CORPORATE = "CORPORATE",
}

export interface Address {
    city: string,
    postCode: string | null,
    street: string | null,
    houseNumber: string | null,
    flatNumber: string | null,
}

export interface Contact {
    email: string | null,
    telephone: string | null,
    address: Address | null,
}

export interface Client {
    id: number,
    firstName: string | null,
    lastName: string | null,
    companyName: string | null,
    note: string | null,
    clientType: ClientType,
    contact: Contact | null
}
