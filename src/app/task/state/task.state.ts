import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {TaskRestService} from "../rest/task-rest.service";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {Task} from "../../generated/models/task";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {Store} from "@ngrx/store";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {refreshStage} from "../../stage/state";
import {UpdateTaskStatus} from "../model/task";


export interface TaskState extends AppState {
    projectId: number | undefined,
    stageId: number | undefined,
    taskId: number | undefined,
    error: string,
    task: Task | null
}

export const initialState: TaskState = {
    projectId: undefined,
    stageId: undefined,
    taskId: undefined,
    error: '',
    task: null
}

export const TaskStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, taskRestService = inject(TaskRestService), stageStore = inject(Store<TaskState>),
                 messageService = inject(MessageService)) => ({
        setProjectId(projectId: number) {
            patchState(store, {projectId: projectId});
        },
        setStageId(stageId: number) {
            patchState(store, {stageId: stageId});
        },
        setTaskId(taskId: number) {
            patchState(store, {taskId: taskId});
        },

        loadTaskRx: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return taskRestService.loadTask(store.projectId()!, store.stageId()!, store.taskId()!)
                        .pipe(
                            tap(task => patchState(store, {task: task})),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading task.`,
                                    detail: `There was a problem with loading task with id ${store.taskId()!}.`
                                });
                                return of(error)
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
                                stageStore.dispatch(refreshStage());
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task created.`,
                                    detail: `Task with id: ${task.id} was created.`
                                });
                            }),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error creating task.`,
                                    detail: `There was a problem with creating a new task.`
                                });
                                return of(error)
                            })
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
                                stageStore.dispatch(refreshStage());
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task status changed.`,
                                    detail: `Status of task with id: ${task.id} was changed to ${task.status}.`
                                });
                            }),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error changing task status.`,
                                    detail: `There was problem with changing task status: ${error}.`
                                });
                                return of(error)
                            })
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
                                stageStore.dispatch(refreshStage());
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task updated.`,
                                    detail: `Task with id: ${task.id} was updated.`
                                });
                            }),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error updating task.`,
                                    detail: `There was problem with updating task: ${error}.`
                                });
                                return of(error)
                            })
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
                            tap(task => {
                                stageStore.dispatch(refreshStage());
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task removed.`,
                                    detail: `Task with id: ${store.taskId()!} was removed.`
                                });
                            }),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error removing task.`,
                                    detail: `There was problem with removing task: ${error}.`
                                });
                                return of(error)
                            })
                        )
                })
            )
        ),
    }))
)
