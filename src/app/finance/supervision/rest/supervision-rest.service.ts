import {environment} from "../../../../environments/environment";
import {Supervision} from "../../../generated/models/supervision";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";

export abstract class SupervisionRestService {
    abstract getSupervision(projectId: number): Observable<Supervision>;

    abstract createSupervision(supervision: Supervision): Observable<Supervision>;

    abstract getSupervisionVisits(supervisionId: number): Observable<SupervisionVisit[]>;

    abstract createSupervisionVisit(supervisionId: number, visit: SupervisionVisit): Observable<SupervisionVisit>;
}

@Injectable()
export class SupervisionRestServiceImpl extends AbstractRestService implements SupervisionRestService {
    private projectUrl: string = `${environment.baseUrl}/projects`;
    private supervisionUrl: string = `${environment.baseUrl}/supervisions`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getSupervision(projectId: number): Observable<Supervision> {
        return this.httpClient.get<Supervision>(`${this.projectUrl}/${projectId}/supervisions`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error loading supervision for project with id: ${projectId}`)))
    }

    createSupervision(supervision: Supervision): Observable<Supervision> {
        return this.httpClient.post<Supervision>(`${this.supervisionUrl}`, supervision)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error creating supervision for project with id: ${supervision.projectId}`)));
    }

    getSupervisionVisits(supervisionId: number): Observable<SupervisionVisit[]> {
        return this.httpClient.get<SupervisionVisit[]>(`${this.supervisionUrl}/${supervisionId}/visits`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error loading visits for supervision with id: ${supervisionId}`)));
    }

    createSupervisionVisit(supervisionId: number, visit: SupervisionVisit): Observable<SupervisionVisit> {
        return this.httpClient.post<SupervisionVisit>(`${this.supervisionUrl}/${supervisionId}/visits`, visit)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error creating visit for supervision with id: ${supervisionId}`)));
    }
}
