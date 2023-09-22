import {catchError, Observable, throwError} from "rxjs";
import {Project} from "../project";
import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

export abstract class ProjectRestService {
    abstract getProjects(): Observable<Project[]>;
}

@Injectable()
export class ProjectRestServiceImpl implements ProjectRestService {
    private projectUrl: string = 'http://0.0.0.0:8100/projects';

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
    }

    getProjects(): Observable<Project[]> {
        return this.httpClient.get<Project[]>(this.projectUrl)
            .pipe(
                catchError(error => this.handleError(error, this))
            );
    }

    handleError(error: HttpErrorResponse, that: ProjectRestServiceImpl) {
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
