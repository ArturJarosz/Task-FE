import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Task} from "../../generated/models/task";
import {DeleteTaskDto} from "../model/task";

@Component({
    selector: 'task-list',
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.less'
})
export class TaskListComponent {
    @Input()
    tasks!: Task[] | null;
    @Input()
    taskTypes!: ConfigurationEntry[] | null;
    @Input()
    taskStatuses!: ConfigurationEntry[] | null;
    @Input()
    projectId: number = 0;
    @Input()
    stageId: number = 0;
    @Output()
    deleteTaskEVent: EventEmitter<DeleteTaskDto> = new EventEmitter<DeleteTaskDto>();

    getTypeLabel(type: string): string {
        return resolveLabel(type, this.taskTypes);
    }

    getStatusLabel(type: string): string {
        return resolveLabel(type, this.taskStatuses);
    }

    deleteTask($event: MouseEvent, taskName: string, taskId: number) {
        $event.stopPropagation();
        this.deleteTaskEVent.emit({taskName: taskName, taskId: taskId});
    }
}
