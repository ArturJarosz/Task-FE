import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ClientRestService} from "../rest/client-rest.service";
import {
    createClient,
    createClientError,
    createClientSuccess,
    loadClient,
    loadClientError,
    loadClients,
    loadClientsError,
    loadClientsSuccess,
    loadClientSuccess,
    removeClient,
    removeClientError,
    removeClientSuccess
} from "./client.action";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

@Injectable()
export class ClientEffects {
    constructor(private actions$: Actions, private clientRestService: ClientRestService,
                private messageService: MessageService) {
    };

    loadClients$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadClients),
            mergeMap(() => this.clientRestService.getClients()
                .pipe(
                    map(clients =>
                        loadClientsSuccess({clients: clients})
                    ),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: "Error loading clients.",
                            detail: `There was a problem with loading clients.`
                        });
                        return of(loadClientsError({error: error}))
                    })
                ))
        )
    });

    loadClient$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadClient),
            mergeMap(action => this.clientRestService.getClient(action.clientId)
                .pipe(
                    map(client => loadClientSuccess({client: client})),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error loading client.`,
                            detail: `There was a problem with loading client with id ${action.clientId}.`
                        });
                        return of(loadClientError({error: error}))
                    })
                ))
        )
    });

    createClient$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(createClient),
            mergeMap(action => this.clientRestService.createClient(action.client)
                .pipe(
                    map(client => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Client created.`,
                            detail: `Client with id: ${client.id} was created.`
                        });
                        return createClientSuccess({client: client})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error creating client`,
                            detail: `There was a problem with creating new client.`
                        });
                        return of(createClientError({error: error}))
                    })
                )
            )
        )
    });

    removeClient$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(removeClient),
            mergeMap(action => this.clientRestService.deleteClient(action.clientId)
                .pipe(
                    map(client => removeClientSuccess()
                    ),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error removing client.`,
                            detail: `There was a problem with removing client with id ${action.clientId}.`
                        });
                        return of(removeClientError({error: error}))
                    })
                ))
        )
    });

}
