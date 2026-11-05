import {computed, inject, LOCALE_ID} from "@angular/core";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {MessageService} from "primeng/api";
import {AppState} from "../../state/app.store";
import {TimeEntry} from "../../generated/models/time-entry";
import {TimeEntryRestService} from "../rest/time-entry-rest.service";
import {formatDuration} from "../../shared/duration/duration.pipe";
import {MessageSeverity} from "../../shared/message";
import {TaskStore} from "../../task/state/task.state";
import {StageStore} from "../../stage/state";
import {ProjectStore, ProjectTimeSummaryStore} from "../../project/state";

// The task a time entry belongs to, by the ids its endpoints take
export interface TimeEntryTask {
    projectId: number;
    stageId: number;
    taskId: number;
}

export interface TimeEntryState extends AppState {
    // The task whose entries are held
    task: TimeEntryTask | null,
    // Latest work date first, as the backend sends them
    timeEntries: TimeEntry[],
    // True once the entries of the task were loaded; later loads refresh them in place
    timeEntriesLoaded: boolean,
    timeEntriesLoadFailed: boolean,
    // An entry is being added or edited
    timeEntrySaving: boolean,
}

const initialState: TimeEntryState = {
    task: null,
    timeEntries: [],
    timeEntriesLoaded: false,
    timeEntriesLoadFailed: false,
    timeEntrySaving: false,
}

export function isSameTask(a: TimeEntryTask | null, b: TimeEntryTask | null): boolean {
    return !!a && !!b && a.projectId === b.projectId && a.stageId === b.stageId && a.taskId === b.taskId;
}

// Time entries of the task page's task, and adding, editing and deleting entries of any task
export const TimeEntryStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({timeEntries, timeEntriesLoaded, timeEntriesLoadFailed}) => ({
        timeEntriesLoading: computed(() => !timeEntriesLoaded() && !timeEntriesLoadFailed()),
        timeEntriesMinutes: computed(() =>
            timeEntries().reduce((sum, timeEntry) => sum + (timeEntry.durationMinutes ?? 0), 0)),
    })),
    withMethods((store, timeEntryRestService = inject(TimeEntryRestService), taskStore = inject(TaskStore),
                 stageStore = inject(StageStore), projectStore = inject(ProjectStore),
                 projectTimeSummaryStore = inject(ProjectTimeSummaryStore), messageService = inject(MessageService),
                 locale = inject(LOCALE_ID)) => {
        const loadTimeEntries = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {timeEntriesLoadFailed: false})),
                switchMap(() => {
                    const task = store.task();
                    if (!task) {
                        return EMPTY;
                    }
                    return timeEntryRestService.getTimeEntries(task.projectId, task.stageId, task.taskId)
                        .pipe(
                            tap(timeEntries => {
                                // A late answer for a task left in the meantime is dropped
                                if (isSameTask(store.task(), task)) {
                                    patchState(store, {timeEntries: timeEntries, timeEntriesLoaded: true});
                                }
                            }),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {timeEntriesLoadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        );
        // Time spent is summed up on the task, its stage and its project, so every total on screen loads again
        const afterChange = (task: TimeEntryTask) => {
            if (isSameTask(store.task(), task)) {
                loadTimeEntries();
            }
            taskStore.refreshTask(task.taskId);
            stageStore.refreshStage();
            stageStore.refreshStages();
            projectStore.setProjectNeedsRefresh();
            projectTimeSummaryStore.setTimeSummaryNeedsRefresh();
        };
        const duration = (timeEntry: TimeEntry) => formatDuration(timeEntry.durationMinutes, locale);
        return {
            // Drops the entries of the previous task, so they never show while the new ones load
            setTask(task: TimeEntryTask): void {
                if (!isSameTask(store.task(), task)) {
                    patchState(store, {
                        task: {...task}, timeEntries: [], timeEntriesLoaded: false, timeEntriesLoadFailed: false
                    });
                }
            },
            loadTimeEntries: loadTimeEntries,
            // Adds an entry (no id) or edits one. afterSave runs only when the save worked, so the dialog stays open
            // with what was typed after an error
            saveTimeEntry: rxMethod<{ task: TimeEntryTask, timeEntry: TimeEntry, afterSave?: () => void }>(
                pipe(
                    concatMap(({task, timeEntry, afterSave}) => {
                        patchState(store, {timeEntrySaving: true});
                        const isNew = timeEntry.id == null;
                        const request = isNew
                            ? timeEntryRestService.createTimeEntry(task.projectId, task.stageId, task.taskId, timeEntry)
                            : timeEntryRestService.updateTimeEntry(task.projectId, task.stageId, task.taskId,
                                timeEntry.id!, timeEntry);
                        return request.pipe(
                            tap(saved => {
                                afterChange(task);
                                messageService.add(isNew
                                    ? {
                                        severity: MessageSeverity.SUCCESS, summary: `Time logged`,
                                        detail: `${duration(saved)} was added to the task.`
                                    }
                                    : {
                                        severity: MessageSeverity.SUCCESS, summary: `Time entry saved`,
                                        detail: `The entry now has ${duration(saved)}.`
                                    });
                                afterSave?.();
                            }),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {timeEntrySaving: false}))
                        );
                    })
                )
            ),
            deleteTimeEntry: rxMethod<{ task: TimeEntryTask, timeEntry: TimeEntry }>(
                pipe(
                    concatMap(({task, timeEntry}) => {
                        return timeEntryRestService.deleteTimeEntry(task.projectId, task.stageId, task.taskId,
                            timeEntry.id!)
                            .pipe(
                                tap(() => {
                                    afterChange(task);
                                    messageService.add({
                                        severity: MessageSeverity.SUCCESS, summary: `Time entry deleted`,
                                        detail: `${duration(timeEntry)} was removed from the task.`
                                    });
                                }),
                                catchError(() => EMPTY)
                            );
                    })
                )
            ),
        };
    })
)
