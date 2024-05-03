import {Component, inject, OnInit} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getTaskStatusConfiguration,
    getTaskTypeConfiguration,
    loadConfiguration
} from "../../shared/configuration/state";
import {Observable} from "rxjs";
import {DeleteTaskDto, UpdateTaskDto, UpdateTaskStatus} from "../model/task";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'app-task-detail-shell',
    templateUrl: './task-detail-shell.component.html',
    styleUrl: './task-detail-shell.component.less'
})
export class TaskDetailShellComponent implements OnInit {
    projectId!: number;
    stageId!: number;
    taskId!: number;

    readonly taskStore = inject(TaskStore);
    $task = this.taskStore.task;

    taskStatuses!: Observable<ConfigurationEntry[]>;
    taskTypes!: Observable<ConfigurationEntry[]>;

    constructor(private route: ActivatedRoute, private configurationStore: Store<ConfigurationState>,
                private router: Router, private confirmationService: ConfirmationService) {
        this.configurationStore.dispatch(loadConfiguration());
        this.taskStatuses = this.configurationStore.select(getTaskStatusConfiguration);
        this.taskTypes = this.configurationStore.select(getTaskTypeConfiguration);
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
