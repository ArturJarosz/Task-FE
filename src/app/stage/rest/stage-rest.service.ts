import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Stage} from "../../generated/models/stage";

export abstract class StageRestService {
    abstract getStagesForProject(projectId: number): Observable<Stage[]>;

    abstract getStage(projectId: number, stageId: number): Observable<Stage>;

    abstract createStage(projectId: number, stage: Stage): Observable<Stage>;

    abstract removeStage(projectId: number, stageId: number): Observable<void>;
}

@Injectable()
export class StageRestServiceImpl extends AbstractRestService implements StageRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getStagesForProject(projectId: number): Observable<Stage[]> {
        return this.httpClient.get<Stage[]>(`${this.projectsUrl}/${projectId}/stages`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    getStage(projectId: number, stageId: number): Observable<Stage> {
        return this.httpClient.get<Stage>(`${this.projectsUrl}/${projectId}/stages/${stageId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    createStage(projectId: number, stage: Stage): Observable<Stage> {
        return this.httpClient.post<Stage>(`${this.projectsUrl}/${projectId}/stages`, stage)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    removeStage(projectId: number, stageId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.projectsUrl}/${projectId}/stages/${stageId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
