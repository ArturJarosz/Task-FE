import {AppState} from "../../../state/app.store";
import {ApplicationConfiguration} from "../model/configuration";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {ConfigurationRestService} from "../rest/configuration.rest";
import {inject} from "@angular/core";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {MessageService} from "primeng/api";

export interface ConfigurationState extends AppState {
    error: string;
    configuration: ApplicationConfiguration;
    needRefresh: boolean;
    configurationLoadFailed: boolean;
}

export const initialState: ConfigurationState = {
    error: '',
    configuration: {
        supplierTypes: [],
        contractorTypes: [],
        contractStatuses: [],
        projectTypes: [],
        projectStatuses: [],
        activeProjectStatuses: [],
        stageStatuses: [],
        stageTypes: [],
        taskStatuses: [],
        taskTypes: [],
        clientTypes: [],
        costCategories: []
    },
    needRefresh: true,
    configurationLoadFailed: false,
}

export const ConfigurationStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, configurationRestService = inject(ConfigurationRestService),
                 messageService = inject(MessageService)) => ({
        loadConfiguration: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {configurationLoadFailed: false})),
                switchMap(() => {
                    if (store.needRefresh()!) {
                        return configurationRestService.getConfiguration()
                            .pipe(
                                tap(configuration => patchState(store,
                                    {configuration: configuration, needRefresh: false})),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {configurationLoadFailed: true});
                                    return EMPTY;
                                })
                            )
                    }
                    return of({})
                })
            )
        )
    }))
)


