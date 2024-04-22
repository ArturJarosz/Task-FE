/* tslint:disable */
/* eslint-disable */
import { CostCategory } from '../models/cost-category';
export interface Cost {
  category: CostCategory;
  date: string;
  hasInvoice: boolean;
  id?: number;
  name: string;
  note?: string;
  paid: boolean;
  payable?: boolean;
  value: number;
}
