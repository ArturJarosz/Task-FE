import {Component, Input} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Task} from "../../generated/models/task";

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

    getTypeLabel(type: string): string {
        return resolveLabel(type, this.taskTypes);
    }

    getStatusLabel(type: string): string {
        return resolveLabel(type, this.taskStatuses);
    }

}
