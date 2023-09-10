import {catchError, Observable, throwError} from "rxjs";
import {Architect} from "../model/architect";
import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";

export abstract class ArchitectRestService {
    abstract getArchitects(): Observable<Architect[]>;
}

@Injectable()
export class ArchitectRestServiceImpl implements ArchitectRestService {
    private architectUrl: string = 'http://0.0.0.0:8100/architects';

    constructor(private httpClient: HttpClient) {
    }

    getArchitects(): Observable<Architect[]> {
        return this.httpClient.get<Architect[]>(this.architectUrl)
            .pipe(
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
