/* tslint:disable */
/* eslint-disable */
import { ContractorCategory } from './contractor-category';
export interface Contractor {
  category: ContractorCategory;
  email?: string;
  id?: number;
  name: string;
  note?: string;
  telephone?: string;
}
