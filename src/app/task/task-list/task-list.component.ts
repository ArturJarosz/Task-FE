import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Task} from "../../generated/models/task";
import {DeleteTaskDto} from "../model/task";
import {Architect} from "../../generated/models/architect";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {Menu, MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {Router, RouterLink} from "@angular/router";
import {DatePipe} from "@angular/common";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

@Component({
    selector: 'task-list',
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, ButtonModule, TagModule, MenuModule, RouterLink, DatePipe, TooltipModule, EmptyStateComponent, NotSetComponent]
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

    protected readonly statusSeverity = statusSeverity;
    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

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

    openRowMenu($event: MouseEvent, task: Task, menu: Menu) {
        $event.stopPropagation();
        this.rowMenuItems = [
            {label: 'Open', icon: 'pi pi-arrow-right',
                command: () => this.router.navigate(['/projects', this.projectId, 'stages', this.stageId, 'tasks', task.id])},
            {label: 'Delete task', icon: 'pi pi-trash', command: () => this.deleteTaskEVent.emit({taskName: task.name!, taskId: task.id!})}
        ];
        menu.toggle($event);
    }
}
