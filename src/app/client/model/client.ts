import {Client, ClientType} from "../../generated/models";

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
export const NOTE:string = "note";

export interface ClientDto {
    id: number,
    name: string
}

// "Private" or "Company": one word for the client type everywhere (the configuration's own label says "Corporate")
export function clientTypeLabel(type: ClientType | string | null | undefined): string {
    if (!type) {
        return '';
    }
    return type === ClientType.CORPORATE ? 'Company' : 'Private';
}

export function clientDisplayName(client: Client | null | undefined): string {
    if (!client) {
        return '';
    }
    return client.clientType === ClientType.CORPORATE
        ? client.companyName ?? ''
        : `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
}
