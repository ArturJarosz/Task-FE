import {catchError, Observable} from "rxjs";
import {Project, ProjectCreate} from "../project";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";

export abstract class ProjectRestService {
    abstract getProjects(): Observable<Project[]>;

    abstract createProject(projectCreate: ProjectCreate): Observable<Project>;
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

    createProject(projectCreate: ProjectCreate): Observable<Project> {
        return this.httpClient.post<Project>(this.projectUrl, projectCreate)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
