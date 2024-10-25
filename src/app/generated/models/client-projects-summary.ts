/* tslint:disable */
/* eslint-disable */
import {ProjectSummary} from './project-summary';

export interface ClientProjectsSummary {
    numberOfProjects?: number;
    projects?: Array<ProjectSummary>;
    totalValue?: number;
}
