import {catchError, Observable, throwError} from "rxjs";
import {Architect} from "../model/architect";
import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {MessageSeverity} from "../../shared";
import {MessageService} from "primeng/api";

export abstract class ArchitectRestService {
    abstract getArchitects(): Observable<Architect[]>;

    abstract getArchitect(architectId: number): Observable<Architect>;
}

@Injectable()
export class ArchitectRestServiceImpl implements ArchitectRestService {
    private architectUrl: string = 'http://0.0.0.0:8100/architects';

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
    }

    getArchitects(): Observable<Architect[]> {
        return this.httpClient.get<Architect[]>(this.architectUrl)
            .pipe(
                catchError(error => this.handleError(error, this))
            );
    }

    getArchitect(architectId: number): Observable<Architect> {
        return this.httpClient.get<Architect>(`${this.architectUrl}/${architectId}`)
            .pipe(
                catchError(error => this.handleError(error, this))
            );
    }

    private handleError(error: HttpErrorResponse, that: ArchitectRestServiceImpl) {
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
