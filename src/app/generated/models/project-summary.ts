/* tslint:disable */
/* eslint-disable */
import { ProjectStatus } from '../models/project-status';
import { ProjectType } from '../models/project-type';
export interface ProjectSummary {
  endDate?: string;
  id?: number;
  name?: string;
  startDate?: string;
  status?: ProjectStatus;
  type?: ProjectType;
  value?: number;
}
