/* tslint:disable */
/* eslint-disable */
import { Installment } from './installment';
import { StageStatus } from './stage-status';
import { StageType } from './stage-type';
import { Task } from '../models/task';
export interface Stage {
  deadline?: string;
  endDate?: string;
  id?: number;
  installment?: Installment;
  name?: string;
  nextStatuses?: Array<StageStatus>;
  note?: string;
  startDate?: string;
  status?: StageStatus;
  tasks?: Array<Task>;
  tasksNumber?: number;
  type?: StageType;
}
