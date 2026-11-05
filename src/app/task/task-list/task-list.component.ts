import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveKnownLabel, resolveLabel} from "../../shared/utils/label-utils";
import {Task} from "../../generated/models/task";
import {DeleteTaskDto} from "../model/task";
import {Architect} from "../../generated/models/architect";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {Menu, MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {Router, RouterLink} from "@angular/router";
import {DatePipe} from "@angular/common";
import {TooltipModule} from "primeng/tooltip";
import {DurationPipe, EmptyStateComponent, NotSetComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {SortRowsPipe} from "../../shared/sort-rows/sort-rows.pipe";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

@Component({
    selector: 'task-list',
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [SortRowsPipe, TableModule, ButtonModule, TagModule, MenuModule, RouterLink, DatePipe, TooltipModule, EmptyStateComponent, NotSetComponent,
        DurationPipe]
})
export class TaskListComponent {

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: Task, field: string): SortValue => {
        switch (field) {
            case 'architect':
                return this.getArchitectName(row.architectId);
            case 'status':
                return this.getStatusLabel(row.status ?? '');
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }

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
    @Output()
    logTimeEvent: EventEmitter<Task> = new EventEmitter<Task>();

    protected readonly statusSeverity = statusSeverity;
    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    getTypeLabel(typeId: number | undefined): string {
        return resolveKnownLabel(typeId, this.taskTypes);
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
            {label: 'Log time', icon: 'pi pi-clock', command: () => this.logTimeEvent.emit(task)},
            {separator: true},
            {label: 'Delete task', icon: 'pi pi-trash', command: () => this.deleteTaskEVent.emit({taskName: task.name!, taskId: task.id!})}
        ];
        menu.toggle($event);
    }
}
