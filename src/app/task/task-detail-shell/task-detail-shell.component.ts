import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {TaskStore} from "../state/task.state";
import {ActivatedRoute} from "@angular/router";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getTaskStatusConfiguration,
    getTaskTypeConfiguration,
    loadConfiguration
} from "../../shared/configuration/state";
import {Observable} from "rxjs";

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

    taskStatuses! :Observable<ConfigurationEntry[]>;
    taskTypes! :Observable<ConfigurationEntry[]>;

    constructor(private route: ActivatedRoute, private configurationStore: Store<ConfigurationState>) {
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

        this.taskStore.loadTaskRx({});
    }

}
