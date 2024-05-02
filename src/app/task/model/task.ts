import {TaskStatus} from "../../generated/models/task-status";
import {Task} from "../../generated/models/task";

export interface UpdateTaskStatus {
    status: TaskStatus
}

export interface UpdateTaskDto {
    task: Task
    updateStatus: boolean
    updateData: boolean
}

export interface DeleteTaskDto {
    taskName: string,
    taskId: number
}
