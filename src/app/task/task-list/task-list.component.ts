import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Task} from "../../generated/models/task";
import {DeleteTaskDto} from "../model/task";
import {Architect} from "../../generated/models/architect";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

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
    architects!: Architect[] | null;
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

    getArchitectInitials(architectId?: number): string {
        if (!architectId) return ARCHITECT_NOT_FOUND_INITIAL;
        const architect = this.architects?.find(a => a.id === architectId);
        if (architect?.firstName && architect?.lastName) {
            return `${architect.firstName.charAt(0)}${architect.lastName.charAt(0)}`.toUpperCase();
        }
        return ARCHITECT_NOT_FOUND_INITIAL;
    }

    getArchitectName(architectId?: number): string {
        if (!architectId) return '';
        const architect = this.architects?.find(a => a.id === architectId);
        if (architect?.firstName && architect?.lastName) {
            return `${architect.firstName} ${architect.lastName}`;
        }
        return '';
    }

    deleteTask($event: MouseEvent, taskName: string, taskId: number) {
        $event.stopPropagation();
        this.deleteTaskEVent.emit({taskName: taskName, taskId: taskId});
    }
}
