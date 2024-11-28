/* tslint:disable */
/* eslint-disable */
import { FinancialPartialData } from '../models/financial-partial-data';
import { Installment } from '../models/installment';
export interface InstallmentProjectData {
  financialData?: FinancialPartialData;
  installments?: Array<Installment>;
  stagesWithoutInstallment?: Array<number>;
}
