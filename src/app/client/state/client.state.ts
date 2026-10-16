import {AppState} from "../../state/app.store";
import {Client} from "../../generated/models/client";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {ClientRestService} from "../rest/client-rest.service";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";

export interface ClientState extends AppState {
    error: string;
    clients: Client[];
    clientId: number | undefined;
    client: Client | null;
    clientsNeedRefresh: boolean;
    clientNeedsRefresh: boolean;
    clientProjectsSummary: EntityProjectsSummary | null;
    clientLoadFailed: boolean;
}

export const initialState: ClientState = {
    error: '',
    clients: [],
    clientId: undefined,
    client: null,
    clientsNeedRefresh: true,
    clientNeedsRefresh: true,
    clientProjectsSummary: null,
    clientLoadFailed: false,
}

export const ClientStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, clientRestService = inject(ClientRestService), messageService = inject(MessageService)) => ({
        setClientId(clientId: number) {
            if (store.clientId() != clientId) {
                this.setClientNeedRefresh();
                // Drop the previous client's projects so they don't show while the new ones load
                patchState(store, {clientProjectsSummary: null});
            }
            patchState(store, {clientId: clientId});
        },
        setClientNeedRefresh() {
            patchState(store, {clientNeedsRefresh: true});
        },
        loadClient: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {clientLoadFailed: false})),
                switchMap(() => {
                    if (store.clientNeedsRefresh()) {
                        return clientRestService.getClient(store.clientId()!)
                            .pipe(
                                tap(client => patchState(store, {client: client, clientNeedsRefresh: false})),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {clientLoadFailed: true});
                                    return EMPTY;
                                })
                            )
                    }
                    return of({});
                })
            )
        ),
        loadClients: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.clientsNeedRefresh()) {
                        return clientRestService.getClients()
                            .pipe(
                                tap(clients => patchState(store, {clients: clients, clientsNeedRefresh: false})),
                                catchError(() => EMPTY)
                            )
                    }
                    return of({});
                })
            )
        ),
        deleteClient: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return clientRestService.deleteClient(store.clientId()!)
                        .pipe(
                            tap(() => {
                                patchState(store, {clientsNeedRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Client removed.`,
                                    detail: `A client with id: ${store.clientId()} was removed.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        createClient: rxMethod<{ client: Client }>(
            pipe(
                switchMap(({client}) => {
                    return clientRestService.createClient(client)
                        .pipe(
                            tap(() => {
                                patchState(store, {clientsNeedRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Client created.`,
                                    detail: `A new client was created.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        updateClient: rxMethod<{ client: Client }>(
            pipe(
                switchMap(({client}) => {
                    return clientRestService.updateClient(store.clientId()!, client)
                        .pipe(
                            tap(client => {
                                let clientName = client?.firstName ? `${client?.firstName} ${client?.lastName}` : `${client?.companyName}`;
                                patchState(store, {clientsNeedRefresh: true, clientNeedsRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Client updated.`,
                                    detail: `A client ${clientName} was updated.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        loadClientProjectsSummary: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return clientRestService.getClientProjectsSummary(store.clientId()!)
                        .pipe(
                            tap(clientProjectsSummary => patchState(store,
                                {clientProjectsSummary: clientProjectsSummary})),
                            catchError(() => EMPTY)
                        )
                })
            )
        )
    }))
)
