/* tslint:disable */
/* eslint-disable */
import { Installment } from '../models/installment';
import { ProjectFinancialPartialData } from '../models/project-financial-partial-data';
export interface InstallmentProjectData {
  financialData?: ProjectFinancialPartialData;
  installments?: Array<Installment>;
}
