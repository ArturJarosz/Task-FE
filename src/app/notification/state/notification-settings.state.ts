import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {AppState} from "../../state/app.store";
import {NotificationSetting} from "../../generated/models/notification-setting";
import {NotificationRestService} from "../rest/notification-rest.service";
import {NotificationStore} from "./notification.state";
import {MessageSeverity} from "../../shared/message";

export interface NotificationSettingsState extends AppState {
    settings: NotificationSetting[];
    settingsLoading: boolean;
    settingsLoadFailed: boolean;
    saving: boolean;
}

export const initialState: NotificationSettingsState = {
    settings: [],
    settingsLoading: false,
    settingsLoadFailed: false,
    saving: false
}

export const NotificationSettingsStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, notificationRestService = inject(NotificationRestService),
                 notificationStore = inject(NotificationStore), messageService = inject(MessageService)) => ({
        loadSettings: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {settingsLoading: true, settingsLoadFailed: false})),
                switchMap(() => notificationRestService.getNotificationSettings()
                    .pipe(
                        tap(settings => patchState(store, {settings, settingsLoading: false})),
                        catchError(() => {
                            patchState(store, {settingsLoading: false, settingsLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        ),
        saveSettings: rxMethod<NotificationSetting[]>(
            pipe(
                tap(() => patchState(store, {saving: true})),
                switchMap(settings => notificationRestService.updateNotificationSettings(settings)
                    .pipe(
                        tap(saved => {
                            patchState(store, {settings: saved, saving: false});
                            messageService.add({severity: MessageSeverity.SUCCESS, summary: 'Notification settings saved'});
                            // Turning a type off or on changes the notifications, so the bell's count is loaded again
                            notificationStore.loadCount({});
                        }),
                        catchError(() => {
                            patchState(store, {saving: false});
                            return EMPTY;
                        })
                    ))
            )
        ),
    }))
)
