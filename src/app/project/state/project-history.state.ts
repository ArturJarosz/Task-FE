import {computed, inject} from "@angular/core";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {AppState} from "../../state/app.store";
import {ProjectRestService} from "../rest/project-rest.service";
import {HistoryEntry} from "../../generated/models/history-entry";

// A project, or a stage or task of it
export interface HistoryScope {
    projectId: number,
    stageId?: number,
    taskId?: number,
}

export interface ProjectHistoryState extends AppState {
    scope: HistoryScope | undefined,
    // Always the history of scope: it is dropped when the scope changes
    history: HistoryEntry[] | null,
    historyLoadFailed: boolean,
}

const initialState: ProjectHistoryState = {
    scope: undefined,
    history: null,
    historyLoadFailed: false,
}

// Changes made to a project, its contract, stages and tasks (the History panel of a project, stage or task page).
// Nearly every change in the project adds to it, so it has no "needs refresh" flag to be set by all those stores: it
// is loaded each time a history is shown, with the last one kept on screen meanwhile
export const ProjectHistoryStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({history, historyLoadFailed}) => ({
        historyLoading: computed(() => history() === null && !historyLoadFailed()),
    })),
    withMethods((store, projectRestService = inject(ProjectRestService)) => ({
        setScope(scope: HistoryScope) {
            const current = store.scope();
            if (current?.projectId !== scope.projectId || current.stageId !== scope.stageId
                || current.taskId !== scope.taskId) {
                patchState(store, {scope: scope, history: null, historyLoadFailed: false});
            }
        },
        loadHistory: rxMethod<void>(
            pipe(
                tap(() => patchState(store, {historyLoadFailed: false})),
                switchMap(() => {
                    const scope = store.scope();
                    if (scope === undefined) {
                        return EMPTY;
                    }
                    return projectRestService.getProjectHistory(scope.projectId, scope.stageId, scope.taskId)
                        .pipe(
                            tap(history => {
                                // A late answer for a scope left in the meantime is dropped
                                if (store.scope() === scope) {
                                    patchState(store, {history: history});
                                }
                            }),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {historyLoadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        ),
    }))
)
