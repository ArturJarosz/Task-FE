/* tslint:disable */
/* eslint-disable */
import { Installment } from '../models/installment';
import { StageStatus } from '../models/stage-status';
import { StageType } from '../models/stage-type';
import { Task } from '../models/task';
export interface Stage {
  createdDateTime?: string;
  deadline?: string;
  endDate?: string;
  id?: number;
  installment?: Installment;
  lastModifiedDateTime?: string;
  name?: string;
  nextStatuses?: Array<StageStatus>;
  note?: string;
  startDate?: string;
  status?: StageStatus;
  tasks?: Array<Task>;
  tasksNumber?: number;
  type?: StageType;
}
