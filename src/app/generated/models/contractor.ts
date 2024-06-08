/* tslint:disable */
/* eslint-disable */
import { ContractorCategory } from '../models/contractor-category';
export interface Contractor {
  category?: ContractorCategory;
  createdDateTime?: string;
  email?: string;
  id?: number;
  lastModifiedDateTime?: string;
  name?: string;
  note?: string;
  telephone?: string;
}
