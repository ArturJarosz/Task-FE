/* tslint:disable */
/* eslint-disable */
import { SupplierCategory } from '../models/supplier-category';
export interface Supplier {
  category?: SupplierCategory;
  email?: string;
  id?: number;
  name?: string;
  note?: string;
  telephone?: string;
}
