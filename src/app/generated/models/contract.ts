/* tslint:disable */
/* eslint-disable */
import { ContractStatus } from '../models/contract-status';
export interface Contract {
  createdDateTime?: string;
  deadline?: string;
  endDate?: string;
  id?: number;
  lastModifiedDateTime?: string;
  nextStatuses?: Array<ContractStatus>;
  offerValue?: number;
  signingDate?: string;
  startDate?: string;
  status?: ContractStatus;
}
