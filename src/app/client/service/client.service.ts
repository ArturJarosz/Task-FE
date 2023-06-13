import {Client} from "../client";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {Injectable} from "@angular/core";

export abstract class ClientService {
    abstract getClients(): Observable<Client[]>;

    abstract getClient(clientId: number): Observable<Client>;
}

@Injectable()
export class ClientServiceImpl implements ClientService {
    private clientUrl: string = 'http://0.0.0.0:8100/clients';

    constructor(private httpClient: HttpClient) {
    }

    getClients(): Observable<Client[]> {
        return this.httpClient.get<Client[]>(this.clientUrl).pipe(
            tap(data => console.log("All clients: " + JSON.stringify(data))),
            catchError(this.handleError)
        );
    }

    getClient(clientId: number): Observable<Client> {
        return this.httpClient.get<Client>(`${this.clientUrl}/${clientId}`).pipe(
            tap(data => console.log("Client: " + JSON.stringify(data))),
            catchError(this.handleError)
        );
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
