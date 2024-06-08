/* tslint:disable */
/* eslint-disable */
import { CostCategory } from '../models/cost-category';
export interface Cost {
  category?: CostCategory;
  createdDateTime?: string;
  date?: string;
  hasInvoice?: boolean;
  id?: number;
  lastModifiedDateTime?: string;
  name?: string;
  note?: string;
  paid?: boolean;
  payable?: boolean;
  value?: number;
}
