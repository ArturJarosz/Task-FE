import {Component, inject, OnInit, Signal} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfigurationStore} from "../../shared/configuration/state";
import {DeleteTaskDto, UpdateTaskDto, UpdateTaskStatus} from "../model/task";
import {ConfirmationService} from "primeng/api";
import {Task} from "../../generated/models/task";

@Component({
    selector: 'task-detail-shell',
    templateUrl: './task-detail-shell.component.html',
    styleUrl: './task-detail-shell.component.less'
})
export class TaskDetailShellComponent implements OnInit {
    projectId!: number;
    stageId!: number;
    taskId!: number;

    readonly taskStore = inject(TaskStore);
    readonly configurationStore = inject(ConfigurationStore);
    $task: Signal<Task | null> = this.taskStore.task;
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskTypes;
    $taskStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskStatuses;

    constructor(private route: ActivatedRoute, private router: Router,
                private confirmationService: ConfirmationService) {
        this.configurationStore.loadConfiguration({});
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.projectId = Number(maybeProjectId);
        let maybeStageId = this.route.snapshot.paramMap.get('stageId');
        this.stageId = Number(maybeStageId);
        let maybeTaskId = this.route.snapshot.paramMap.get('taskId');
        this.taskId = Number(maybeTaskId);

        this.taskStore.setTaskId(this.taskId);
        this.taskStore.setStageId(this.stageId);
        this.taskStore.setProjectId(this.projectId);

        this.taskStore.loadTask({});
    }

    updateTask($event: UpdateTaskDto) {
        if ($event.updateStatus) {
            let updateStatusDto: UpdateTaskStatus = {
                status: $event.task.status!
            }
            this.taskStore.updateStatus({updateStatusDto});
        }
        if ($event.updateData) {
            let task = $event.task!;
            this.taskStore.updateTask({task});
        }
    }

    deleteTask($event: DeleteTaskDto) {
        let projectId = this.projectId;
        let stageId = this.stageId;
        let taskId = $event.taskId;
        let taskName = $event.taskName;
        this.confirmationService.confirm({
            message: `Do you want to delete task: ${taskName}?`,
            header: `Confirm task delete ${taskName}.`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.taskStore.deleteTask({projectId, stageId, taskId});
                this.router.navigate([`/projects/${this.projectId}/stages/${this.stageId}`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
