import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {SystemParameter} from "../../generated/models/system-parameter";
import {GoogleCalendarConnection} from "../../generated/models/google-calendar-connection";
import {GoogleCalendarConnectionRestService} from "../rest/google-calendar-connection-rest.service";
import {SystemParameterStore} from "./system-parameter.state";

// The Google Calendar settings themselves are system parameters, saved through SystemParameterStore; this store
// checks whether Google can be reached with them
export interface GoogleCalendarSettingsState extends AppState {
    connection: GoogleCalendarConnection | null;
    connectionChecking: boolean;
    connectionCheckFailed: boolean;
}

const initialState: GoogleCalendarSettingsState = {
    connection: null,
    connectionChecking: false,
    connectionCheckFailed: false,
}

export const GoogleCalendarSettingsStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, connectionRestService = inject(GoogleCalendarConnectionRestService)) => ({
        // Asks the backend to reach Google with the saved settings; a newer check replaces a running one
        checkConnection: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {connectionChecking: true, connectionCheckFailed: false})),
                switchMap(() => connectionRestService.getConnectionStatus()
                    .pipe(
                        tap(connection => patchState(store, {connection: connection, connectionChecking: false})),
                        catchError(() => {
                            patchState(store, {connection: null, connectionChecking: false, connectionCheckFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        ),
    })),
    withMethods((store, systemParameterStore = inject(SystemParameterStore)) => ({
        // Saved in the given order (the sync is validated against the stored key, so it goes last); the connection is
        // checked again once the save is over
        saveParameters(systemParameters: SystemParameter[]): void {
            systemParameterStore.updateSystemParameters({
                systemParameters: systemParameters,
                successMessage: 'Google Calendar settings saved',
                afterSave: () => store.checkConnection({}),
            });
        },
    }))
)
