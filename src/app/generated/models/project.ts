/* tslint:disable */
/* eslint-disable */
import { Architect } from '../models/architect';
import { Client } from '../models/client';
import { Contract } from '../models/contract';
import { Cost } from '../models/cost';
import { ProjectStatus } from '../models/project-status';
import { ProjectType } from '../models/project-type';
import { Stage } from '../models/stage';
export interface Project {
  architect?: Architect;
  client?: Client;
  contract?: Contract;
  costs?: Array<Cost>;
  deadLine?: string;
  endDate?: string;
  id?: number;
  name?: string;
  nextStatuses?: Array<ProjectStatus>;
  note?: string;
  signingDate?: string;
  stages?: Array<Stage>;
  startDate?: string;
  status?: ProjectStatus;
  type?: ProjectType;
}
