import {AppState} from "../../state/app.store";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {computed, inject} from "@angular/core";
import {TaskRestService} from "../rest/task-rest.service";
import {map} from "rxjs";
import {Task} from "../../generated/models/task";

export interface TaskState extends AppState {
    error: string,
    task: Task | null
}

export const initialState: TaskState = {
    error: '',
    task: null
}

export const TaskStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed((state) => ({
            getTask: computed(() => state.task),
        }
    )),
    withMethods((store, taskRestService = inject(TaskRestService)) => ({
        loadTask(projectId: number, stageId: number, taskId: number) {
            console.log(`Task store - load tasks with id ${taskId}`);
            var task$ = taskRestService.task$;
            taskRestService.loadTask(projectId, stageId, taskId)
                .pipe(
                    map(task => patchState(store, {task: task}))
                )
                .subscribe();
        }
    }))
);
