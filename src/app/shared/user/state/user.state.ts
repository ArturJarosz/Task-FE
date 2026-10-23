import {AppState} from "../../../state/app.store";
import {User} from "../../../generated/models/user";
import {UserConfiguration} from "../../../generated/models/user-configuration";
import {UserConfigurationName} from "../../../generated/models/user-configuration-name";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {UserRestService} from "../rest/user-rest.service";
import {inject} from "@angular/core";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";

export interface UserState extends AppState {
    currentUser: User | null;
    // Settings the current user has defined (USER_CONFIGURATION); null until loaded
    configurations: UserConfiguration[] | null;
    configurationsLoadFailed: boolean;
}

export const initialState: UserState = {
    currentUser: null,
    configurations: null,
    configurationsLoadFailed: false
}

export const UserStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, userRestService = inject(UserRestService)) => ({
        loadCurrentUser: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (!store.currentUser()) {
                        return userRestService.getCurrentUser()
                            .pipe(
                                tap(user => patchState(store, {currentUser: user})),
                                catchError(() => of(null))
                            )
                    }
                    return of({})
                })
            )
        ),
        loadConfigurations: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {configurationsLoadFailed: false})),
                switchMap(() => userRestService.getCurrentUserConfigurations()
                    .pipe(
                        tap(configurations => patchState(store, {configurations: configurations})),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            patchState(store, {configurationsLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        ),
        // The REST service shows the error toast; the setting then just stays in this browser
        updateConfiguration: rxMethod<{ name: UserConfigurationName, value: string }>(
            pipe(
                switchMap(({name, value}) => userRestService.updateCurrentUserConfiguration(name, value)
                    .pipe(
                        tap(saved => patchState(store, {
                            configurations: [
                                ...(store.configurations() ?? []).filter(configuration => configuration.name !== name),
                                saved
                            ]
                        })),
                        catchError(() => EMPTY)
                    ))
            )
        )
    }))
)
