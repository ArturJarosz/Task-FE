import {Component, inject, Input, Signal} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Task} from "../../generated/models/task";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfirmationService} from "primeng/api";
import {TaskStore} from "../state/task.state";
import {DeleteTaskDto} from "../model/task";

@Component({
    selector: 'task-list-shell',
    templateUrl: './task-list-shell.component.html',
    styleUrl: './task-list-shell.component.less'
})
export class TaskListShellComponent {
    @Input()
    tasks: Array<Task> | null = null;
    @Input()
    projectId: number = 0;
    @Input()
    stageId: number = 0;

    readonly taskStore = inject(TaskStore);
    readonly configurationStore = inject(ConfigurationStore);
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskTypes;
    $taskStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskStatuses;

    showAddTaskComponent: boolean = false;

    constructor(private confirmationService: ConfirmationService) {
    }

    onAddTask() {
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
