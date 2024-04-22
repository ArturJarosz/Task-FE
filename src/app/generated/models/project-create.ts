/* tslint:disable */
/* eslint-disable */
import { ProjectType } from '../models/project-type';
export interface ProjectCreate {
  architectId?: number;
  clientId?: number;
  deadline?: string;
  id?: number;
  name?: string;
  offerValue?: number;
  type?: ProjectType;
}
