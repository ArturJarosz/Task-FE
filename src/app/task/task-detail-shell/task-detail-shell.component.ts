import {ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfigurationStore} from "../../shared/configuration/state";
import {DeleteTaskDto, UpdateTaskDto, UpdateTaskStatus} from "../model/task";
import {ConfirmationService} from "primeng/api";
import {Task} from "../../generated/models/task";
import {ArchitectStore} from "../../architect/state/architect.state";
import {Architect} from "../../generated/models/architect";
import {ProjectStore} from "../../project/state";
import {StageStore} from "../../stage/state";
import {TaskDetailComponent} from "../task-detail/task-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
    selector: 'task-detail-shell',
    templateUrl: './task-detail-shell.component.html',
    styleUrl: './task-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TaskDetailComponent, ConfirmDialogModule]
})
export class TaskDetailShellComponent implements OnInit {
    projectId!: number;
    stageId!: number;
    taskId!: number;

    readonly taskStore = inject(TaskStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    readonly stageStore = inject(StageStore);
    // While the store still holds a task from another page, show skeletons instead of the wrong task
    $task: Signal<Task | null> = computed(() => this.taskStore.task()?.id === this.taskId ? this.taskStore.task() : null);
    $taskLoadFailed: Signal<boolean> = this.taskStore.taskLoadFailed;
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskTypes;
    $taskStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskStatuses;
    $architects: Signal<Architect[]> = this.architectStore.architects;
    // Breadcrumb only
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');
    $stageName: Signal<string> = computed(() =>
        this.stageStore.stage()?.id === this.stageId ? this.stageStore.stage()?.name ?? '' : '');

    constructor(private route: ActivatedRoute, private router: Router,
                private confirmationService: ConfirmationService) {
    }

    ngOnInit(): void {
        this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
        this.stageId = Number(this.route.snapshot.paramMap.get('stageId'));
        this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));

        this.taskStore.setTaskId(this.taskId);
        this.taskStore.setStageId(this.stageId);
        this.taskStore.setProjectId(this.projectId);
        this.taskStore.loadTask({});

        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
        if (this.stageStore.stage()?.id !== this.stageId) {
            this.stageStore.setProjectId(this.projectId);
            this.stageStore.setStageId(this.stageId);
            this.stageStore.loadStage({});
        }

        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
    }

    updateTask($event: UpdateTaskDto) {
        if ($event.updateStatus) {
            let updateStatusDto: UpdateTaskStatus = {
                status: $event.task.status!
            }
            this.taskStore.updateStatus({updateStatusDto});
        }
        if ($event.updateData) {
            this.taskStore.updateTask({task: $event.task});
        }
    }

    deleteTask($event: DeleteTaskDto) {
        this.confirmationService.confirm({
            header: 'Delete task',
            message: `Delete ${$event.taskName}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.taskStore.deleteTask({projectId: this.projectId, stageId: this.stageId, taskId: $event.taskId});
                this.router.navigate(['/projects', this.projectId, 'stages', this.stageId]);
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        });
    }

    onReload(): void {
        this.taskStore.loadTask({});
    }
}
