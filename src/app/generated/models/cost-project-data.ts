/* tslint:disable */
/* eslint-disable */
import { Cost } from '../models/cost';
import { FinancialPartialData } from '../models/financial-partial-data';
export interface CostProjectData {
  costs?: Array<Cost>;
  financialData?: FinancialPartialData;
}
