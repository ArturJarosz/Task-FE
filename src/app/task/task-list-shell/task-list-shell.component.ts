import {Component, Input, OnInit} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Observable} from "rxjs";
import {Task} from "../../generated/models/task";
import {
    ConfigurationState,
    getTaskStatusConfiguration,
    getTaskTypeConfiguration
} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";

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

    taskTypes$!: Observable<ConfigurationEntry[]>;
    taskStatuses$!: Observable<ConfigurationEntry[]>;
    showAddTaskComponent: boolean = false;

    constructor(private configurationStore: Store<ConfigurationState>) {
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
}
