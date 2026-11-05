import {ChangeDetectionStrategy, Component, inject, Input, signal, Signal} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Task} from "../../generated/models/task";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfirmationService} from "primeng/api";
import {TaskStore} from "../state/task.state";
import {DeleteTaskDto} from "../model/task";
import {ArchitectStore} from "../../architect/state/architect.state";
import {Architect} from "../../generated/models/architect";
import {TaskListComponent} from "../task-list/task-list.component";
import {AddTaskComponent} from "../add-task/add-task.component";
import {ButtonModule} from "primeng/button";
import {TimeEntry} from "../../generated/models/time-entry";
import {TimeEntryStore} from "../../time-entry/state/time-entry.state";
import {LogTimeDialogComponent} from "../../time-entry/log-time-dialog/log-time-dialog.component";
import {UserStore} from "../../shared/user/state/user.state";
import {defaultArchitectId} from "../../time-entry/default-architect";

@Component({
    selector: 'task-list-shell',
    templateUrl: './task-list-shell.component.html',
    styleUrl: './task-list-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    // The page around it (stage detail) renders the p-confirmDialog for the delete confirmation
    imports: [TaskListComponent, AddTaskComponent, LogTimeDialogComponent, ButtonModule]
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
    readonly architectStore = inject(ArchitectStore);
    readonly timeEntryStore = inject(TimeEntryStore);
    private readonly userStore = inject(UserStore);
    $taskTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskTypes;
    $taskStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.taskStatuses;
    $architects: Signal<Architect[]> = this.architectStore.architects;
    $timeEntrySaving: Signal<boolean> = this.timeEntryStore.timeEntrySaving;
    // "Log time" from a row: the row's task and the new entry, while the dialog is open. Saving reloads the stage,
    // so the task's time and the stage's total update on this page
    readonly $loggedTask = signal<Task | null>(null);
    readonly $loggedTimeEntry = signal<TimeEntry | null>(null);

    showAddTaskComponent: boolean = false;

    constructor(private confirmationService: ConfirmationService) {
        this.architectStore.loadArchitects({});
    }

    get taskCountLabel(): string {
        const count = this.tasks?.length ?? 0;
        return count === 1 ? '1 task' : `${count} tasks`;
    }

    onAddTask() {
        this.showAddTaskComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddTaskComponent = false;
    }

    onLogTime(task: Task): void {
        this.$loggedTask.set(task);
        this.$loggedTimeEntry.set({
            architectId: defaultArchitectId(this.$architects(), this.userStore.currentUser(), task.architectId)
        });
    }

    onSaveTimeEntry(timeEntry: TimeEntry): void {
        const task = this.$loggedTask();
        if (!task) {
            return;
        }
        this.timeEntryStore.saveTimeEntry({
            task: {projectId: this.projectId, stageId: this.stageId, taskId: task.id!},
            timeEntry: timeEntry,
            afterSave: () => this.onCloseLogTime()
        });
    }

    onCloseLogTime(): void {
        this.$loggedTimeEntry.set(null);
        this.$loggedTask.set(null);
    }

    onDelete($event: DeleteTaskDto) {
        let taskId = $event.taskId;
        let projectId = this.projectId;
        let stageId = this.stageId;
        this.confirmationService.confirm({
            header: 'Delete task',
            message: `Delete ${$event.taskName}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.taskStore.deleteTask({projectId, stageId, taskId});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        });
    }
}
