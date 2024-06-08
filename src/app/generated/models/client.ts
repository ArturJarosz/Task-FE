/* tslint:disable */
/* eslint-disable */
import { ClientType } from '../models/client-type';
import { Contact } from '../models/contact';
export interface Client {
  clientType?: ClientType;
  companyName?: string;
  contact?: Contact;
  createdDateTime?: string;
  firstName?: string;
  id?: number;
  lastModifiedDateTime?: string;
  lastName?: string;
  note?: string;
}
