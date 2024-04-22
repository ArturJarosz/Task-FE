/* tslint:disable */
/* eslint-disable */
import { ClientType } from '../models/client-type';
import { Contact } from '../models/contact';
export interface Client {
  clientType: ClientType;
  companyName?: string;
  contact: Contact;
  firstName?: string;
  id?: number;
  lastName?: string;
  note?: string;
}
