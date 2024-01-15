import {Client} from "../client";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";

export abstract class ClientRestService {
    abstract getClients(): Observable<Client[]>;

    abstract getClient(clientId: number): Observable<Client>;

    abstract createClient(client: Client): Observable<any>;

    abstract deleteClient(clientId: number): Observable<void>;
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
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    getClient(clientId: number): Observable<Client> {
        return this.httpClient.get<Client>(`${this.clientUrl}/${clientId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    createClient(client: Client): Observable<Client> {
        return this.httpClient.post<Client>(this.clientUrl, client)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            )
    }

    deleteClient(clientId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.clientUrl}/${clientId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            )
    }
}
