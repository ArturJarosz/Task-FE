export enum ClientType {
    PRIVATE = "PRIVATE",
    CORPORATE = "CORPORATE",
}

export interface Address {
    city: string,
    postCode?: string,
    street: string,
    houseNumber?: string,
    flatNumber?: string,
}

export interface Contact {
    email?: string,
    telephone?: string,
    address?: Address,
}

export interface Client {
    id: number,
    firstName?: string,
    lastName?: string,
    companyName?: string,
    note?: string,
    clientType: ClientType,
    contact?: Contact
}

export interface CreateClient {
}

export interface CreateCorporateClient extends CreateClient {
    clientType: ClientType,
    companyName: string
}

export interface CreatePrivateClient extends CreateClient {
    clientType: ClientType,
    firstName: string,
    lastName: string
}
