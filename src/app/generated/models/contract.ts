/* tslint:disable */
/* eslint-disable */
import { ContractStatus } from '../models/contract-status';
export interface Contract {
  deadline?: string;
  endDate?: string;
  id?: number;
  nextStatuses?: Array<ContractStatus>;
  offerValue: number;
  signingDate?: string;
  startDate?: string;
  status?: ContractStatus;
}
