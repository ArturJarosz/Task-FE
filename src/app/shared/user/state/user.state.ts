import {AppState} from "../../../state/app.store";
import {User} from "../../../generated/models/user";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {UserRestService} from "../rest/user-rest.service";
import {inject} from "@angular/core";
import {catchError, of, pipe, switchMap, tap} from "rxjs";

export interface UserState extends AppState {
    currentUser: User | null;
}

export const initialState: UserState = {
    currentUser: null
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
        )
    }))
)
