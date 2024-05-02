import {Component, inject, Input, OnInit} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Observable} from "rxjs";
import {Task} from "../../generated/models/task";
import {
    ConfigurationState,
    getTaskStatusConfiguration,
    getTaskTypeConfiguration
} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";
import {ConfirmationService} from "primeng/api";
import {TaskStore} from "../state/task.state";
import {DeleteTaskDto} from "../model/task";

@Component({
    selector: 'task-list-shell',
    templateUrl: './task-list-shell.component.html',
    styleUrl: './task-list-shell.component.less'
})
export class TaskListShellComponent implements OnInit {
    @Input()
    tasks: Array<Task> | null = null;
    @Input()
    projectId: number = 0;
    @Input()
    stageId: number = 0;

    readonly taskStore = inject(TaskStore);

    taskTypes$!: Observable<ConfigurationEntry[]>;
    taskStatuses$!: Observable<ConfigurationEntry[]>;
    showAddTaskComponent: boolean = false;

    constructor(private configurationStore: Store<ConfigurationState>, private confirmationService: ConfirmationService) {
    }

    ngOnInit(): void {
        this.taskTypes$ = this.configurationStore.select(getTaskTypeConfiguration);
        this.taskStatuses$ = this.configurationStore.select(getTaskStatusConfiguration);
    }

    onClick() {
        this.showAddTaskComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddTaskComponent = false;
    }

    onDelete($event: DeleteTaskDto) {
        let taskId = $event.taskId;
        let projectId = this.projectId;
        let stageId = this.stageId;
        this.confirmationService.confirm({
            message: `Do you want to delete task: ${$event}?`,
            header: `Confirm task delete ${$event}.`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.taskStore.deleteTask({projectId, stageId, taskId});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
