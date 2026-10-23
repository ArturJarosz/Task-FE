import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, from, of, pipe, switchMap, tap, toArray} from "rxjs";
import {MessageSeverity} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {SystemParameterRestService} from "../rest/system-parameter-rest.service";

export interface SystemParameterState extends AppState {
    systemParameters: SystemParameter[];
    systemParametersNeedRefresh: boolean;
    systemParametersLoadFailed: boolean;
    // A group of parameters (updateSystemParameters) is being saved
    systemParametersSaving: boolean;
}

export const initialState: SystemParameterState = {
    systemParameters: [],
    systemParametersNeedRefresh: true,
    systemParametersLoadFailed: false,
    systemParametersSaving: false,
}

export const SystemParameterStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, systemParameterRestService = inject(SystemParameterRestService),
                 messageService = inject(MessageService)) => {
        let replaceSystemParameter = (updated: SystemParameter) => patchState(store, {
            systemParameters: store.systemParameters()
                .map(parameter => parameter.id === updated.id ? updated : parameter)
        });
        return {
            setSystemParametersNeedRefresh() {
                patchState(store, {systemParametersNeedRefresh: true});
            },
            loadSystemParameters: rxMethod<{}>(
                pipe(
                    tap(() => patchState(store, {systemParametersLoadFailed: false})),
                    switchMap(() => {
                        if (store.systemParametersNeedRefresh()) {
                            return systemParameterRestService.getSystemParameters()
                                .pipe(
                                    tap(systemParameters => patchState(store, {
                                        systemParameters: systemParameters,
                                        systemParametersNeedRefresh: false
                                    })),
                                    // The REST service already shows the error toast; keep the stream alive for the next load
                                    catchError(() => {
                                        patchState(store, {systemParametersLoadFailed: true});
                                        return EMPTY;
                                    })
                                )
                        }
                        return of({});
                    })
                )
            ),
            updateSystemParameter: rxMethod<{ systemParameter: SystemParameter }>(
                pipe(
                    // Every save must finish: switchMap would drop the result of a save made just before another one
                    concatMap(({systemParameter}) => {
                        return systemParameterRestService.updateSystemParameter(systemParameter.id!, systemParameter)
                            .pipe(
                                tap(updated => {
                                    replaceSystemParameter(updated);
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `${updated.name} saved`,
                                    });
                                }),
                                catchError(() => EMPTY)
                            )
                    })
                )
            ),
            // Saves one by one in the given order and stops at the first error; afterSave runs once the save is over,
            // whether it worked or not
            updateSystemParameters: rxMethod<{
                systemParameters: SystemParameter[],
                successMessage: string,
                afterSave?: () => void
            }>(
                pipe(
                    concatMap(({systemParameters, successMessage, afterSave}) => {
                        patchState(store, {systemParametersSaving: true});
                        return from(systemParameters).pipe(
                            concatMap(parameter => systemParameterRestService.updateSystemParameter(parameter.id!, parameter)),
                            tap(updated => replaceSystemParameter(updated)),
                            toArray(),
                            tap(() => messageService.add({severity: MessageSeverity.INFO, summary: successMessage})),
                            // The REST service already shows the error toast
                            catchError(() => EMPTY),
                            finalize(() => {
                                patchState(store, {systemParametersSaving: false});
                                afterSave?.();
                            })
                        );
                    })
                )
            ),
        };
    })
)
