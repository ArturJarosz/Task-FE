import {AppState} from "../../state/app.store";
import {Architect} from "../../generated/models/architect";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {ArchitectRestService} from "../rest/architect-rest.service";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";

export interface ArchitectState extends AppState {
    architects: Architect[];
    architect: Architect | null;
    architectId: number | undefined;
    architectsNeedRefresh: boolean;
}

export const initialState: ArchitectState = {
    architects: [],
    architect: null,
    architectId: undefined,
    architectsNeedRefresh: true
}

export const ArchitectStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, architectRestService = inject(ArchitectRestService), messageService = inject(MessageService)) => ({
            setArchitectId(architectId: number) {
                patchState(store, {architectId: architectId})
            },
            loadArchitect: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return architectRestService.getArchitect(store.architectId()!)
                            .pipe(
                                tap(architect => patchState(store,
                                    {architect: architect}))
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
                                        {architects: architects, architectsNeedRefresh: false}))
                                )
                        }
                        return of({});
                    })
                )
            ),
        })
    )
)

