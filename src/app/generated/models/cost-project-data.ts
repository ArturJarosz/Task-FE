/* tslint:disable */
/* eslint-disable */
import {Cost} from './cost';
import {ProjectFinancialPartialData} from './project-financial-partial-data';

export interface CostProjectData {
    costs?: Array<Cost>;
    financialData?: ProjectFinancialPartialData;
}
