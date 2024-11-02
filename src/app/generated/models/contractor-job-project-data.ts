/* tslint:disable */
/* eslint-disable */
import { ContractorJob } from '../models/contractor-job';
import { ProjectFinancialPartialData } from '../models/project-financial-partial-data';
export interface ContractorJobProjectData {
  contractorJobs?: Array<ContractorJob>;
  financialData?: ProjectFinancialPartialData;
}
