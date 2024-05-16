import {AppState} from "../../../state/app.store";
import {ApplicationConfiguration} from "../model/configuration";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {ConfigurationRestService} from "../rest/configuration.rest";
import {inject} from "@angular/core";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../message";

export interface ConfigurationState extends AppState {
    error: string;
    configuration: ApplicationConfiguration;
    needRefresh: boolean
}

export const initialState: ConfigurationState = {
    error: '',
    configuration: {
        supplierTypes: [],
        contractorTypes: [],
        contractStatuses: [],
        projectTypes: [],
        projectStatuses: [],
        stageStatuses: [],
        stageTypes: [],
        taskStatuses: [],
        taskTypes: [],
        clientTypes: [],
        costCategories: []
    },
    needRefresh: true
}

export const ConfigurationStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, configurationRestService = inject(ConfigurationRestService),
                 messageService = inject(MessageService)) => ({
        loadConfiguration: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.needRefresh()!) {
                        return configurationRestService.getConfiguration()
                            .pipe(
                                tap(configuration => patchState(store,
                                    {configuration: configuration, needRefresh: false})),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error loading configuration.`,
                                        detail: `There was a problem with loading application configuration.`,
                                    });
                                    return of(error);
                                })
                            )
                    }
                    return of({})
                })
            )
        )
    }))
)


