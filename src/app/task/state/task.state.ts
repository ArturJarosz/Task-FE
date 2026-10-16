import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {TaskRestService} from "../rest/task-rest.service";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {Task} from "../../generated/models/task";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {StageStore} from "../../stage/state";
import {ProjectStore} from "../../project/state";
import {UpdateTaskStatus} from "../model/task";


export interface TaskState extends AppState {
    projectId: number | undefined,
    stageId: number | undefined,
    taskId: number | undefined,
    error: string,
    task: Task | null,
    taskLoadFailed: boolean,
}

export const initialState: TaskState = {
    projectId: undefined,
    stageId: undefined,
    taskId: undefined,
    error: '',
    task: null,
    taskLoadFailed: false,
}

export const TaskStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, taskRestService = inject(TaskRestService), stageStore = inject(StageStore),
                 projectStore = inject(ProjectStore), messageService = inject(MessageService)) => {
        // Task changes can change the stage and project status the backend derives from them
        const refreshParents = () => {
            stageStore.refreshStage();
            stageStore.refreshStages();
            projectStore.setProjectNeedsRefresh();
            projectStore.setProjectsNeedRefresh();
        };
        return {
        setProjectId(projectId: number) {
            patchState(store, {projectId: projectId});
        },
        setStageId(stageId: number) {
            patchState(store, {stageId: stageId});
        },
        setTaskId(taskId: number) {
            patchState(store, {taskId: taskId});
        },

        loadTask: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {taskLoadFailed: false})),
                switchMap(() => {
                    return taskRestService.loadTask(store.projectId()!, store.stageId()!, store.taskId()!)
                        .pipe(
                            tap(task => patchState(store, {task: task})),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {taskLoadFailed: true});
                                return EMPTY;
                            })
                        )
                })
            )
        ),
        createTask: rxMethod<{ projectId: number, stageId: number, task: Task }>(
            pipe(
                switchMap(({projectId, stageId, task}) => {
                    return taskRestService.createTask(projectId, stageId, task)
                        .pipe(
                            tap(task => {

                                refreshParents();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task created`,
                                    detail: `${task.name} was added to the stage.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        updateStatus: rxMethod<{
            updateStatusDto: UpdateTaskStatus
        }>
        (
            pipe(
                switchMap(({updateStatusDto}) => {
                    return taskRestService.updateStatus(store.projectId()!, store.stageId()!, store.taskId()!,
                        updateStatusDto)
                        .pipe(
                            tap(task => {
                                patchState(store, {task: task});
                                refreshParents();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task status changed`,
                                    detail: `${task.name} has a new status.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        updateTask: rxMethod<{
            task: Task
        }>
        (
            pipe(
                switchMap(({task}) => {
                    return taskRestService.updateTask(store.projectId()!, store.stageId()!, store.taskId()!, task)
                        .pipe(
                            tap(task => {
                                patchState(store, {task: task});
                                refreshParents();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task saved`,
                                    detail: `${task.name} was updated.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        deleteTask: rxMethod<{
            projectId: number,
            stageId: number,
            taskId: number
        }>
        (
            pipe(
                switchMap(({projectId, stageId, taskId}) => {
                    patchState(store, {projectId: projectId});
                    patchState(store, {stageId: stageId});
                    patchState(store, {taskId: taskId});
                    return taskRestService.removeTask(store.projectId()!, store.stageId()!, store.taskId()!)
                        .pipe(
                            tap(() => {
                                refreshParents();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task deleted`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        };
    })
)
