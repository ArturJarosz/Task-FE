import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {ProjectCreate} from "../../generated/models/project-create";
import {Project} from "../../generated/models/project";

export abstract class ProjectRestService {
    abstract getProjects(): Observable<Project[]>;

    abstract getProject(projectId: number): Observable<Project>;

    abstract createProject(projectCreate: ProjectCreate): Observable<Project>;

    abstract updateProject(projectId: number, project: Project): Observable<Project>;

    abstract removeProject(projectId: number): Observable<void>;
}

@Injectable()
export class ProjectRestServiceImpl extends AbstractRestService implements ProjectRestService {
    private projectUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjects(): Observable<Project[]> {
        return this.httpClient.get<Project[]>(this.projectUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    getProject(projectId: number): Observable<Project> {
        return this.httpClient.get<Project>(`${this.projectUrl}/${projectId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    createProject(projectCreate: ProjectCreate): Observable<Project> {
        return this.httpClient.post<Project>(this.projectUrl, projectCreate)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    updateProject(projectId: number, project: Project): Observable<Project> {
        return this.httpClient.put<Project>(`${this.projectUrl}/${projectId}`, project)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    removeProject(projectId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.projectUrl}/${projectId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
