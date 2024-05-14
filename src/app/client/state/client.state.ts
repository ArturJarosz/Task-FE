import {AppState} from "../../state/app.store";
import {Client} from "../../generated/models/client";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {ClientRestService} from "../rest/client-rest.service";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

export interface ClientState extends AppState {
    error: string;
    clients: Client[];
    clientId: number | undefined;
    client: Client | null,
    clientsNeedRefresh: boolean,
    clientNeedsRefresh: boolean
}

export const initialState: ClientState = {
    error: '',
    clients: [],
    clientId: undefined,
    client: null,
    clientsNeedRefresh: false,
    clientNeedsRefresh: false
}

export const ClientStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, clientRestService = inject(ClientRestService), messageService = inject(MessageService)) => ({
        setClientId(clientId: number) {
            patchState(store, {clientId: clientId});
        },
        loadClient: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return clientRestService.getClient(store.clientId()!)
                        .pipe(
                            tap(client => patchState(store, {client: client, clientNeedsRefresh: false})),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading client.`,
                                    detail: `There was a problem with loading client with id ${store.clientId()!}.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        ),
        loadClients: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return clientRestService.getClients()
                        .pipe(
                            tap(clients => patchState(store, {clients: clients, clientsNeedRefresh: false})),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading clients.`,
                                    detail: `There was a problem with loading clients.`,
                                });
                                return of(error);
                            })
                        )
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
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error removing client.`,
                                    detail: `There was a problem with removing client.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        ),
        createClient: rxMethod<{client: Client}>(
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
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error creating client.`,
                                    detail: `There was a problem with creating client.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        )
    }))
)
