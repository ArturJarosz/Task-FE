import {catchError, Observable} from "rxjs";
import {Cost} from "../../model/finance";
import {Injectable} from "@angular/core";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../../environments/environment";

export abstract class CostRestService {
    abstract getCost(projectId: number, costId: number): Observable<Cost>;

    abstract createCost(projectId: number, cost: Cost): Observable<Cost>;
}

@Injectable()
export class CostRestServiceImpl extends AbstractRestService implements CostRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getCost(projectId: number, costId: number): Observable<Cost> {
        return this.httpClient.get<Cost>(`${this.projectsUrl}/costs/${costId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    createCost(projectId: number, cost: Cost): Observable<Cost> {
        return this.httpClient.post<Cost>(`${this.projectsUrl}/${projectId}/costs`, cost)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
