/* tslint:disable */
/* eslint-disable */
import { ContractorJob } from '../models/contractor-job';
import { FinancialPartialData } from '../models/financial-partial-data';
export interface ContractorJobProjectData {
  contractorJobs?: Array<ContractorJob>;
  financialData?: FinancialPartialData;
}
