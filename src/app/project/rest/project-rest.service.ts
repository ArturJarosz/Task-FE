import {catchError, Observable} from "rxjs";
import {Project} from "../project";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";

export abstract class ProjectRestService {
    abstract getProjects(): Observable<Project[]>;
}

@Injectable()
export class ProjectRestServiceImpl extends AbstractRestService implements ProjectRestService {
    private projectUrl: string = 'http://0.0.0.0:8100/projects';

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjects(): Observable<Project[]> {
        return this.httpClient.get<Project[]>(this.projectUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
