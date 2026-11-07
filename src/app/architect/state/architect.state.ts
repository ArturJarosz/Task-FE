import {AppState} from "../../state/app.store";
import {Architect} from "../../generated/models/architect";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, of, pipe, switchMap, tap} from "rxjs";
import {ArchitectRestService} from "../rest/architect-rest.service";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {MessageSeverity} from "../../shared/message";

export interface ArchitectState extends AppState {
    architects: Architect[];
    architect: Architect | null;
    architectId: number | undefined;
    architectsNeedRefresh: boolean;
    architectProjectsSummary: EntityProjectsSummary;
    architectLoadFailed: boolean;
    architectsLoadFailed: boolean;
    // A link to an account is being saved or removed
    accountSaving: boolean;
}

export const initialState: ArchitectState = {
    architects: [],
    architect: null,
    architectId: undefined,
    architectsNeedRefresh: true,
    architectProjectsSummary: {},
    architectLoadFailed: false,
    architectsLoadFailed: false,
    accountSaving: false,
}

// A linked or unlinked account changes only this architect, wherever it is shown
function withSavedArchitect(state: ArchitectState, saved: Architect): Partial<ArchitectState> {
    return {
        architect: state.architect?.id === saved.id ? saved : state.architect,
        architects: state.architects.map(architect => architect.id === saved.id ? saved : architect),
    };
}

export const ArchitectStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, architectRestService = inject(ArchitectRestService), messageService = inject(MessageService)) => ({
            setArchitectsNeedRefresh() {
                patchState(store, {architectsNeedRefresh: true});
            },
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
                    tap(() => patchState(store, {architectsLoadFailed: false})),
                    switchMap(() => {
                        if (store.architectsNeedRefresh()) {
                            return architectRestService.getArchitects()
                                .pipe(
                                    tap(architects => patchState(store,
                                        {architects: architects, architectsNeedRefresh: false})),
                                    // The REST service already shows the error toast; keep the stream alive for the next load
                                    catchError(() => {
                                        patchState(store, {architectsLoadFailed: true});
                                        return EMPTY;
                                    })
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
            ),
            // afterSave runs only when the link was saved; onError lets the dialog stay open and refresh its list
            linkUser: rxMethod<{ architectId: number, userId: number, afterSave?: () => void, onError?: () => void }>(
                pipe(
                    concatMap(({architectId, userId, afterSave, onError}) => {
                        patchState(store, {accountSaving: true});
                        return architectRestService.linkUser(architectId, userId)
                            .pipe(
                                tap(architect => {
                                    patchState(store, state => withSavedArchitect(state, architect));
                                    messageService.add({severity: MessageSeverity.INFO, summary: 'Account linked'});
                                    afterSave?.();
                                }),
                                catchError(() => {
                                    onError?.();
                                    return EMPTY;
                                }),
                                finalize(() => patchState(store, {accountSaving: false}))
                            );
                    })
                )
            ),
            unlinkUser: rxMethod<{ architectId: number, afterSave?: () => void }>(
                pipe(
                    concatMap(({architectId, afterSave}) => {
                        patchState(store, {accountSaving: true});
                        return architectRestService.unlinkUser(architectId)
                            .pipe(
                                tap(architect => {
                                    patchState(store, state => withSavedArchitect(state, architect));
                                    messageService.add({severity: MessageSeverity.INFO, summary: 'Account unlinked'});
                                    afterSave?.();
                                }),
                                catchError(() => EMPTY),
                                finalize(() => patchState(store, {accountSaving: false}))
                            );
                    })
                )
            )
        })
    )
)

