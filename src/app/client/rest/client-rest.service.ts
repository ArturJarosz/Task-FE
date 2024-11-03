import {HttpClient} from "@angular/common/http";
import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {Client} from "../../generated/models/client";
import {ClientProjectsSummary} from "../../generated/models/client-projects-summary";

export abstract class ClientRestService {
    abstract getClients(): Observable<Client[]>;

    abstract getClient(clientId: number): Observable<Client>;

    abstract createClient(client: Client): Observable<Client>;

    abstract deleteClient(clientId: number): Observable<void>;

    abstract updateClient(clientId: number, client: Client): Observable<Client>;

    abstract getClientProjectsSummary(clientId: number): Observable<ClientProjectsSummary>;
}

@Injectable()
export class ClientRestServiceImpl extends AbstractRestService implements ClientRestService {
    private clientUrl: string = `${environment.baseUrl}/clients`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super()
    }

    getClients(): Observable<Client[]> {
        return this.httpClient.get<Client[]>(this.clientUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading clients`))
            );
    }

    getClient(clientId: number): Observable<Client> {
        return this.httpClient.get<Client>(`${this.clientUrl}/${clientId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading a client with id ${clientId}`))
            );
    }

    createClient(client: Client): Observable<Client> {
        return this.httpClient.post<Client>(this.clientUrl, client)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error creating a client`))
            )
    }

    deleteClient(clientId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.clientUrl}/${clientId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error removing a client with id ${clientId}`))
            )
    }

    updateClient(clientId: number, client: Client): Observable<Client> {
        return this.httpClient.put<Client>(`${this.clientUrl}/${clientId}`, client)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error updating a client with id: ${clientId}`))
            );
    }

    getClientProjectsSummary(clientId: number): Observable<ClientProjectsSummary> {
        return this.httpClient.get<ClientProjectsSummary>(`${this.clientUrl}/${clientId}/projects`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading projects summary for client with id": ${clientId}`))
            );
    }

}
