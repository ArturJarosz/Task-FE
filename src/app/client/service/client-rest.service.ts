import {Client} from "../client";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {Injectable} from "@angular/core";

export abstract class ClientRestService {
    abstract getClients(): Observable<Client[]>;

    abstract getClient(clientId: number): Observable<Client>;

    abstract createClient(client: Client): Observable<any>;

    abstract deleteClient(clientId: number): Observable<void>;
}

@Injectable()
export class ClientRestServiceImpl implements ClientRestService {
    private clientUrl: string = 'http://0.0.0.0:8100/clients';

    constructor(private httpClient: HttpClient) {
    }

    getClients(): Observable<Client[]> {
        return this.httpClient.get<Client[]>(this.clientUrl)
            .pipe(
                catchError(this.handleError)
            );
    }

    getClient(clientId: number): Observable<Client> {
        return this.httpClient.get<Client>(`${this.clientUrl}/${clientId}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    createClient(client: Client): Observable<Client> {
        return this.httpClient.post<Client>(this.clientUrl, client)
            .pipe(
                catchError(this.handleError)
            )
    }

    deleteClient(clientId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.clientUrl}/${clientId}`).pipe(
            catchError(this.handleError)
        )
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `An error occurred: ${error.error.message}`;
        } else {
            errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }

        console.error(errorMessage);
        return throwError(() => errorMessage);
    }


}
