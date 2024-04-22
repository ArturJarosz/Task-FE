/* tslint:disable */
/* eslint-disable */
import { TaskStatus } from '../models/task-status';
import { TaskType } from '../models/task-type';
export interface Task {
  endDate?: string;
  id?: number;
  name?: string;
  nextStatuses?: Array<TaskStatus>;
  note?: string;
  startDate?: string;
  status?: TaskStatus;
  type?: TaskType;
}
