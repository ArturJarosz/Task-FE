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
            //taskRestService.setProjectId(projectId);
        },
        setStageId(stageId: number) {
            patchState(store, {stageId: stageId});
            //taskRestService.setStageId(stageId)
        },
        setTaskId(taskId: number) {
            patchState(store, {taskId: taskId});
            //taskRestService.setTaskId(taskId);
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
        )
    }))
)
