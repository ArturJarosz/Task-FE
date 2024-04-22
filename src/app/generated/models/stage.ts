/* tslint:disable */
/* eslint-disable */
import { Installment } from '../models/installment';
import { StageStatus } from '../models/stage-status';
import { StageType } from '../models/stage-type';
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
  tasksNumber?: number;
  type?: StageType;
}
