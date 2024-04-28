import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {Injectable} from "@angular/core";
import {Task} from "../../generated/models/task";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";

export abstract class TaskRestService {
    abstract loadTask(projectId: number, stageId: number, taskId: number): Observable<Task>;
    abstract createTask(projectId: number, stageId: number, task: Task): Observable<Task>;

    abstract task$: Observable<Task>;
}

@Injectable()
export class TaskRestServiceImpl extends AbstractRestService implements TaskRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    loadTask(projectId: number, stageId: number, taskId: number): Observable<Task> {
        return this.httpClient.get<Task>(`${this.projectsUrl}/${projectId}/stages/${stageId}/tasks/${taskId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    createTask(projectId: number, stageId: number, task: Task): Observable<Task> {
        return this.httpClient.post<Task>(`${this.projectsUrl}/${projectId}/stages/${stageId}/tasks`, task)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    task$ = this.httpClient.get<Task>(`${this.projectsUrl}`)
        .pipe(
            catchError(error => this.handleError(error, this.messageService))
        );
}
