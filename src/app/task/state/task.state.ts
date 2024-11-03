import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {TaskRestService} from "../rest/task-rest.service";
import {pipe, switchMap, tap} from "rxjs";
import {Task} from "../../generated/models/task";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {StageStore} from "../../stage/state";
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
    withMethods((store, taskRestService = inject(TaskRestService), stageStore = inject(StageStore),
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

        loadTask: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return taskRestService.loadTask(store.projectId()!, store.stageId()!, store.taskId()!)
                        .pipe(
                            tap(task => patchState(store, {task: task}))
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

                                stageStore.refreshStage();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task created.`,
                                    detail: `Task with id: ${task.id} was created.`
                                });
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
                                patchState(store, {task: task});
                                stageStore.refreshStage();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task status changed.`,
                                    detail: `Status of task with id: ${task.id} was changed to ${task.status}.`
                                });
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
                                patchState(store, {task: task});
                                stageStore.refreshStage();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task updated.`,
                                    detail: `Task ${task.name} was updated.`
                                });
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
                            tap(() => {
                                stageStore.refreshStage();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Task removed.`,
                                    detail: `Task with id: ${store.taskId()!} was removed.`
                                });
                            })
                        )
                })
            )
        ),
    }))
)
