import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {ProjectType} from "../../generated/models/project-type";

export abstract class ProjectTypeRestService {
    abstract getProjectTypes(): Observable<ProjectType[]>;

    abstract createProjectType(projectType: ProjectType): Observable<ProjectType>;

    abstract updateProjectType(projectTypeId: number, projectType: ProjectType): Observable<ProjectType>;

    abstract deleteProjectType(projectTypeId: number): Observable<void>;
}

@Injectable()
export class ProjectTypeRestServiceImpl extends AbstractRestService implements ProjectTypeRestService {
    private projectTypesUrl: string = `${environment.baseUrl}/project-types`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjectTypes(): Observable<ProjectType[]> {
        return this.httpClient.get<ProjectType[]>(this.projectTypesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading project types`))
            );
    }

    createProjectType(projectType: ProjectType): Observable<ProjectType> {
        return this.httpClient.post<ProjectType>(this.projectTypesUrl, projectType)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error creating project type`))
            );
    }

    updateProjectType(projectTypeId: number, projectType: ProjectType): Observable<ProjectType> {
        return this.httpClient.put<ProjectType>(`${this.projectTypesUrl}/${projectTypeId}`, projectType)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error renaming project type with id ${projectTypeId}`))
            );
    }

    deleteProjectType(projectTypeId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.projectTypesUrl}/${projectTypeId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting project type with id ${projectTypeId}`))
            );
    }
}
