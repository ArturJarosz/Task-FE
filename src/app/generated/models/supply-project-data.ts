/* tslint:disable */
/* eslint-disable */
import { ProjectFinancialPartialData } from '../models/project-financial-partial-data';
import { Supply } from '../models/supply';
export interface SupplyProjectData {
  financialData?: ProjectFinancialPartialData;
  supplies?: Array<Supply>;
}
