import {ChangeDetectionStrategy, Component, computed, inject, LOCALE_ID, OnInit, signal, Signal} from '@angular/core';
import {formatDate} from "@angular/common";
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
import {TimeEntry} from "../../generated/models/time-entry";
import {TimeEntryStore, TimeEntryTask} from "../../time-entry/state/time-entry.state";
import {LogTimeDialogComponent} from "../../time-entry/log-time-dialog/log-time-dialog.component";
import {TimeEntriesDialogComponent} from "../../time-entry/time-entries-dialog/time-entries-dialog.component";
import {QuickLog} from "../../time-entry/task-time-card/task-time-card.component";
import {formatDuration} from "../../shared";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {UserStore} from "../../shared/user/state/user.state";
import {defaultArchitectId} from "../../time-entry/default-architect";

@Component({
    selector: 'task-detail-shell',
    templateUrl: './task-detail-shell.component.html',
    styleUrl: './task-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TaskDetailComponent, LogTimeDialogComponent, TimeEntriesDialogComponent, ConfirmDialogModule]
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
    readonly timeEntryStore = inject(TimeEntryStore);
    private readonly userStore = inject(UserStore);
    private readonly locale = inject(LOCALE_ID);
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
    $timeEntries: Signal<TimeEntry[]> = this.timeEntryStore.timeEntries;
    $timeEntriesLoading: Signal<boolean> = this.timeEntryStore.timeEntriesLoading;
    $timeEntriesLoadFailed: Signal<boolean> = this.timeEntryStore.timeEntriesLoadFailed;
    $timeEntrySaving: Signal<boolean> = this.timeEntryStore.timeEntrySaving;
    // Who new time is logged for: the quick entry in the Time spent card, and where the Log time dialog starts
    $logArchitectId: Signal<number | undefined> = computed(() =>
        defaultArchitectId(this.$architects(), this.userStore.currentUser(), this.$task()?.architectId));
    // The entry in the "Log time" dialog, open while set
    readonly $loggedTimeEntry = signal<TimeEntry | null>(null);
    readonly $timeEntriesOpen = signal(false);
    // Time typed in the Time spent card while the Log time dialog asks who it is for; cleared from the card once saved
    private quickLogAwaitingArchitect: QuickLog | null = null;

    constructor(private route: ActivatedRoute, private router: Router,
                private confirmationService: ConfirmationService) {
    }

    ngOnInit(): void {
        this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
        this.stageId = Number(this.route.snapshot.paramMap.get('stageId'));
        this.taskId = Number(this.route.snapshot.paramMap.get('taskId'));
        // Type labels come from the configuration, which a type change in Settings marks stale
        this.configurationStore.loadConfiguration({});

        this.taskStore.setTaskId(this.taskId);
        this.taskStore.setStageId(this.stageId);
        this.taskStore.setProjectId(this.projectId);
        this.taskStore.loadTask({});
        this.timeEntryStore.setTask(this.timeEntryTask);
        this.timeEntryStore.loadTimeEntries();

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

    onLogTime(): void {
        this.$loggedTimeEntry.set({architectId: this.$logArchitectId()});
    }

    // Time typed in the Time spent card: today, by the same architect the Log time dialog starts with
    onQuickLog(quickLog: QuickLog): void {
        const task = this.$task();
        if (!task) {
            return;
        }
        const architectId = this.$logArchitectId();
        if (architectId === undefined) {
            // Nobody to log it for yet: the dialog opens with the typed time, and the architect is chosen there
            this.quickLogAwaitingArchitect = quickLog;
            this.$loggedTimeEntry.set({durationMinutes: quickLog.durationMinutes});
            return;
        }
        this.timeEntryStore.saveTimeEntry({
            task: this.timeEntryTask,
            timeEntry: {
                workDate: toTimeZoneString(new Date()), architectId: architectId,
                durationMinutes: quickLog.durationMinutes
            },
            afterSave: quickLog.onSaved
        });
    }

    onEditTimeEntry(timeEntry: TimeEntry): void {
        this.$loggedTimeEntry.set(timeEntry);
    }

    onSaveTimeEntry(timeEntry: TimeEntry): void {
        this.timeEntryStore.saveTimeEntry({
            task: this.timeEntryTask, timeEntry: timeEntry, afterSave: () => {
                this.quickLogAwaitingArchitect?.onSaved();
                this.onCloseLogTime();
            }
        });
    }

    onCloseLogTime(): void {
        this.quickLogAwaitingArchitect = null;
        this.$loggedTimeEntry.set(null);
    }

    onDeleteTimeEntry(timeEntry: TimeEntry): void {
        const duration = formatDuration(timeEntry.durationMinutes, this.locale);
        const workDate = timeEntry.workDate ? formatDate(timeEntry.workDate, 'dd.MM.yyyy', this.locale) : '';
        this.confirmationService.confirm({
            header: 'Delete time entry',
            message: `Delete the ${duration} logged on ${workDate}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.timeEntryStore.deleteTimeEntry({task: this.timeEntryTask, timeEntry: timeEntry});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        });
    }

    onReloadTimeEntries(): void {
        this.timeEntryStore.loadTimeEntries();
    }

    private get timeEntryTask(): TimeEntryTask {
        return {projectId: this.projectId, stageId: this.stageId, taskId: this.taskId};
    }
}
