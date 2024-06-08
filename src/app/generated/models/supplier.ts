/* tslint:disable */
/* eslint-disable */
import { SupplierCategory } from '../models/supplier-category';
export interface Supplier {
  category?: SupplierCategory;
  createdDateTime?: string;
  email?: string;
  id?: number;
  lastModifiedDateTime?: string;
  name?: string;
  note?: string;
  telephone?: string;
}
