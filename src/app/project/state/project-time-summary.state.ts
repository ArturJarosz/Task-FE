import {computed, inject} from "@angular/core";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {AppState} from "../../state/app.store";
import {ProjectRestService} from "../rest/project-rest.service";
import {ProjectTimeSummary} from "../../generated/models/project-time-summary";

export interface ProjectTimeSummaryState extends AppState {
    projectId: number | undefined,
    // Always the summary of projectId: it is dropped when the project changes
    timeSummary: ProjectTimeSummary | null,
    timeSummaryNeedsRefresh: boolean,
    timeSummaryLoadFailed: boolean,
}

const initialState: ProjectTimeSummaryState = {
    projectId: undefined,
    timeSummary: null,
    timeSummaryNeedsRefresh: true,
    timeSummaryLoadFailed: false,
}

// Time spent on a project and what it earned per hour (the overview's "Time and rate" card and the Finance tab)
export const ProjectTimeSummaryStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({timeSummary, timeSummaryLoadFailed}) => ({
        timeSummaryLoading: computed(() => timeSummary() === null && !timeSummaryLoadFailed()),
    })),
    withMethods((store, projectRestService = inject(ProjectRestService)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() !== projectId) {
                patchState(store, {
                    projectId: projectId, timeSummary: null, timeSummaryNeedsRefresh: true, timeSummaryLoadFailed: false
                });
            }
        },
        // Time entries, supervision visits and the project's finances all change the summary
        setTimeSummaryNeedsRefresh(): void {
            patchState(store, {timeSummaryNeedsRefresh: true});
        },
        loadTimeSummary: rxMethod<void>(
            pipe(
                tap(() => patchState(store, {timeSummaryLoadFailed: false})),
                switchMap(() => {
                    const projectId = store.projectId();
                    if (projectId === undefined) {
                        return EMPTY;
                    }
                    return projectRestService.getProjectTimeSummary(projectId)
                        .pipe(
                            tap(timeSummary => {
                                // A late answer for a project left in the meantime is dropped
                                if (store.projectId() === projectId) {
                                    patchState(store, {timeSummary: timeSummary, timeSummaryNeedsRefresh: false});
                                }
                            }),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {timeSummaryNeedsRefresh: false, timeSummaryLoadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        ),
    }))
)
