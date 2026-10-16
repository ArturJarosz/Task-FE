import {AppState} from "../../state/app.store";
import {Architect} from "../../generated/models/architect";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {ArchitectRestService} from "../rest/architect-rest.service";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";

export interface ArchitectState extends AppState {
    architects: Architect[];
    architect: Architect | null;
    architectId: number | undefined;
    architectsNeedRefresh: boolean;
    architectProjectsSummary: EntityProjectsSummary;
    architectLoadFailed: boolean;
}

export const initialState: ArchitectState = {
    architects: [],
    architect: null,
    architectId: undefined,
    architectsNeedRefresh: true,
    architectProjectsSummary: {},
    architectLoadFailed: false,
}

export const ArchitectStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, architectRestService = inject(ArchitectRestService), messageService = inject(MessageService)) => ({
            setArchitectId(architectId: number) {
                if (store.architectId() !== architectId) {
                    // Drop the previous architect's projects so they don't show while the new ones load
                    patchState(store, {architectProjectsSummary: {}});
                }
                patchState(store, {architectId: architectId})
            },
            loadArchitect: rxMethod<{}>(
                pipe(
                    tap(() => patchState(store, {architectLoadFailed: false})),
                    switchMap(() => {
                        return architectRestService.getArchitect(store.architectId()!)
                            .pipe(
                                tap(architect => patchState(store,
                                    {architect: architect})),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {architectLoadFailed: true});
                                    return EMPTY;
                                })
                            )
                    })
                )
            ),
            loadArchitects: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        if (store.architectsNeedRefresh()) {
                            return architectRestService.getArchitects()
                                .pipe(
                                    tap(architects => patchState(store,
                                        {architects: architects, architectsNeedRefresh: false})),
                                    catchError(() => EMPTY)
                                )
                        }
                        return of({});
                    })
                )
            ),
            loadArchitectProjectsSummary: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return architectRestService.getArchitectProjectSummary(store.architectId()!)
                            .pipe(
                                tap(architectProjectsSummary => patchState(store, {
                                    architectProjectsSummary: architectProjectsSummary
                                })),
                                catchError(() => EMPTY)
                            )
                    })
                )
            )
        })
    )
)

