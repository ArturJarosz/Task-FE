import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, pipe, switchMap, tap} from "rxjs";
import {MessageService} from "primeng/api";
import {SystemParameter} from "../../generated/models/system-parameter";
import {GoogleCalendarConnection} from "../../generated/models/google-calendar-connection";
import {GoogleCalendarConnectionStatus} from "../../generated/models/google-calendar-connection-status";
import {CalendarShare} from "../../generated/models/calendar-share";
import {GoogleCalendarConnectionRestService} from "../rest/google-calendar-connection-rest.service";
import {GoogleCalendarShareRestService} from "../rest/google-calendar-share-rest.service";
import {MessageSeverity} from "../../shared";
import {SystemParameterStore} from "./system-parameter.state";

// The Google Calendar settings themselves are system parameters, saved through SystemParameterStore; this store
// checks whether Google can be reached with them and manages who the calendar is shared with
export interface GoogleCalendarSettingsState extends AppState {
    connection: GoogleCalendarConnection | null;
    connectionChecking: boolean;
    connectionCheckFailed: boolean;
    shares: CalendarShare[];
    // True once the list was read from Google; later loads refresh it in place
    sharesLoaded: boolean;
    sharesLoading: boolean;
    sharesLoadFailed: boolean;
    shareAdding: boolean;
    // Email whose access is being revoked
    shareRevoking: string | null;
}

const initialState: GoogleCalendarSettingsState = {
    connection: null,
    connectionChecking: false,
    connectionCheckFailed: false,
    shares: [],
    sharesLoaded: false,
    sharesLoading: false,
    sharesLoadFailed: false,
    shareAdding: false,
    shareRevoking: null,
}

export const GoogleCalendarSettingsStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, shareRestService = inject(GoogleCalendarShareRestService),
                 messageService = inject(MessageService)) => {
        // Sharing lives in Google, so the list is read from there every time. A newer call replaces a running load,
        // and clearing cancels it, so a late answer cannot bring back the shares of an unreachable calendar
        const refreshShares = rxMethod<boolean>(
            pipe(
                switchMap(load => {
                    if (!load) {
                        patchState(store, {shares: [], sharesLoaded: false, sharesLoading: false, sharesLoadFailed: false});
                        return EMPTY;
                    }
                    // Skeletons only until the first answer; a refresh keeps the list and the form on screen
                    patchState(store, {sharesLoading: !store.sharesLoaded(), sharesLoadFailed: false});
                    return shareRestService.getShares()
                        .pipe(
                            tap(shares => patchState(store, {shares: shares, sharesLoaded: true, sharesLoading: false})),
                            catchError(() => {
                                patchState(store, {
                                    shares: [],
                                    sharesLoaded: false,
                                    sharesLoading: false,
                                    sharesLoadFailed: true
                                });
                                return EMPTY;
                            })
                        );
                })
            )
        );
        return {
            loadShares(): void {
                refreshShares(true);
            },
            clearShares(): void {
                refreshShares(false);
            },
            addShare: rxMethod<CalendarShare>(
                pipe(
                    tap(() => patchState(store, {shareAdding: true})),
                    concatMap(share => shareRestService.addShare(share)
                        .pipe(
                            tap(added => {
                                patchState(store, {shares: [...store.shares(), added], shareAdding: false});
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: `Calendar shared with ${added.email}`,
                                    detail: 'Google emails them a link to add it to their calendar',
                                });
                            }),
                            catchError(() => {
                                patchState(store, {shareAdding: false});
                                return EMPTY;
                            })
                        ))
                )
            ),
            removeShare: rxMethod<string>(
                pipe(
                    tap(email => patchState(store, {shareRevoking: email})),
                    concatMap(email => shareRestService.removeShare(email)
                        .pipe(
                            tap(() => {
                                patchState(store, {
                                    shares: store.shares().filter(share => share.email !== email),
                                    shareRevoking: null,
                                });
                                messageService.add({severity: MessageSeverity.INFO, summary: `Access revoked for ${email}`});
                            }),
                            catchError(() => {
                                patchState(store, {shareRevoking: null});
                                return EMPTY;
                            })
                        ))
                )
            ),
        };
    }),
    withMethods((store, connectionRestService = inject(GoogleCalendarConnectionRestService)) => ({
        // Asks the backend to reach Google with the saved settings; a newer check replaces a running one
        checkConnection: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {connectionChecking: true, connectionCheckFailed: false})),
                switchMap(() => connectionRestService.getConnectionStatus()
                    .pipe(
                        tap(connection => {
                            patchState(store, {connection: connection, connectionChecking: false});
                            // Shares can be read only from a reachable calendar
                            if (connection.status === GoogleCalendarConnectionStatus.CONNECTED) {
                                store.loadShares();
                            } else {
                                store.clearShares();
                            }
                        }),
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
