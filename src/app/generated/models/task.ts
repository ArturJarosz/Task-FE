/* tslint:disable */
/* eslint-disable */
import { TaskStatus } from '../models/task-status';
import { TaskType } from '../models/task-type';
export interface Task {
  createdDateTime?: string;
  endDate?: string;
  id?: number;
  lastModifiedDateTime?: string;
  name?: string;
  nextStatuses?: Array<TaskStatus>;
  note?: string;
  startDate?: string;
  status?: TaskStatus;
  type?: TaskType;
}
