import {AppState} from "../../state/app.store";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {computed, inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {Role} from "../../generated/models/role";
import {ResourcePermissions} from "../../generated/models/resource-permissions";
import {MessageSeverity} from "../../shared/message";
import {RoleRestService} from "../rest/role-rest.service";
import {countPermissions} from "../permissions";

export interface RoleState extends AppState {
    roles: Role[];
    // True once the list was loaded; later loads refresh it in place
    rolesLoaded: boolean;
    rolesLoadFailed: boolean;
    // A create or update is being saved
    roleSaving: boolean;
    // Id of the role being deleted
    roleDeleting: number | null;
    // Every resource with the actions a role can allow on it; they only change with a new version, so null until
    // the first load and kept after it
    availablePermissions: ResourcePermissions[] | null;
    availablePermissionsLoadFailed: boolean;
}

const initialState: RoleState = {
    roles: [],
    rolesLoaded: false,
    rolesLoadFailed: false,
    roleSaving: false,
    roleDeleting: null,
    availablePermissions: null,
    availablePermissionsLoadFailed: false,
}

export const RoleStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({rolesLoaded, rolesLoadFailed, availablePermissions}) => ({
        rolesLoading: computed(() => !rolesLoaded() && !rolesLoadFailed()),
        permissionsCount: computed(() => {
            let resources = availablePermissions();
            return resources ? countPermissions(resources) : null;
        }),
    })),
    withMethods((store, roleRestService = inject(RoleRestService), messageService = inject(MessageService)) => {
        const loadRoles = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {rolesLoadFailed: false})),
                switchMap(() => roleRestService.getRoles()
                    .pipe(
                        tap(roles => patchState(store, {roles: roles, rolesLoaded: true})),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            patchState(store, {rolesLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        );
        const afterChange = (summary: string) => {
            messageService.add({severity: MessageSeverity.INFO, summary: summary});
            loadRoles();
        };
        return {
            loadRoles: loadRoles,
            loadAvailablePermissions: rxMethod<void>(
                pipe(
                    tap(() => patchState(store, {availablePermissionsLoadFailed: false})),
                    switchMap(() => store.availablePermissions() ? EMPTY : roleRestService.getAvailablePermissions()
                        .pipe(
                            tap(resources => patchState(store, {availablePermissions: resources})),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {availablePermissionsLoadFailed: true});
                                return EMPTY;
                            })
                        ))
                )
            ),
            // afterSave runs only when the save worked, so the dialog stays open with what was typed after an error
            saveRole: rxMethod<{ role: Role, afterSave?: () => void }>(
                pipe(
                    concatMap(({role, afterSave}) => {
                        patchState(store, {roleSaving: true});
                        let dto: Role = {name: role.name, permissions: role.permissions};
                        let request = role.id != null
                            ? roleRestService.updateRole(role.id, dto)
                            : roleRestService.createRole(dto);
                        return request.pipe(
                            tap(saved => {
                                afterChange(`${saved.name} saved`);
                                afterSave?.();
                            }),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {roleSaving: false}))
                        );
                    })
                )
            ),
            deleteRole: rxMethod<Role>(
                pipe(
                    concatMap(role => {
                        patchState(store, {roleDeleting: role.id!});
                        return roleRestService.deleteRole(role.id!).pipe(
                            tap(() => afterChange(`${role.name} deleted`)),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {roleDeleting: null}))
                        );
                    })
                )
            ),
        };
    })
);
