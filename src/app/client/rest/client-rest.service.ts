import {Client} from "../client";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

export abstract class ClientRestService {
    abstract getClients(): Observable<Client[]>;

    abstract getClient(clientId: number): Observable<Client>;

    abstract createClient(client: Client): Observable<any>;

    abstract deleteClient(clientId: number): Observable<void>;
}

@Injectable()
export class ClientRestServiceImpl implements ClientRestService {
    private clientUrl: string = 'http://0.0.0.0:8100/clients';

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
    }

    getClients(): Observable<Client[]> {
        return this.httpClient.get<Client[]>(this.clientUrl)
            .pipe(
                catchError(error => this.handleError(error, this))
            );
    }

    getClient(clientId: number): Observable<Client> {
        return this.httpClient.get<Client>(`${this.clientUrl}/${clientId}`)
            .pipe(
                catchError(error => this.handleError(error, this))
            );
    }

    createClient(client: Client): Observable<Client> {
        return this.httpClient.post<Client>(this.clientUrl, client)
            .pipe(
                catchError(error => this.handleError(error, this))
            )
    }

    deleteClient(clientId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.clientUrl}/${clientId}`).pipe(
            catchError(error => this.handleError(error, this))
        )
    }

    handleError(error: HttpErrorResponse, that: ClientRestServiceImpl) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `An error occurred: ${error.error.message}`;
        } else {
            errorMessage = `Response code: ${error.status}, Error: ${error.error.message ? error.error.message : error.message}`;
        }

        that.messageService.add({
            severity: MessageSeverity.ERROR,
            summary: "Error",
            detail: errorMessage,

        })
        return throwError(() => errorMessage);
    }


}
