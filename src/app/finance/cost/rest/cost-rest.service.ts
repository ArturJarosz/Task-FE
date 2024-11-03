import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../../environments/environment";
import {Cost} from "../../../generated/models/cost";
import {CostProjectData} from "../../../generated/models/cost-project-data";

true

export abstract class CostRestService {
    abstract getCost(projectId: number, costId: number): Observable<Cost>;

    abstract createCost(projectId: number, cost: Cost): Observable<Cost>;

    abstract getProjectCosts(projectId: number): Observable<Cost[]>;

    abstract getProjectCostsData(projectId: number): Observable<CostProjectData>;

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
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading cost with id: ${costId}`))
            );
    }

    createCost(projectId: number, cost: Cost): Observable<Cost> {
        return this.httpClient.post<Cost>(`${this.projectsUrl}/${projectId}/costs`, cost)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error creating new cost for a project with id: ${projectId}`))
            );
    }

    getProjectCosts(projectId: number): Observable<Cost[]> {
        return this.httpClient.get<Cost[]>(`${this.projectsUrl}/${projectId}/costs`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error getting costs for project with id: ${projectId}`))
            );
    }

    getProjectCostsData(projectId: number): Observable<CostProjectData> {
        return this.httpClient.get<CostProjectData>(`${this.projectsUrl}/${projectId}/costs-data`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error getting costs data for project with id: ${projectId}`))
            );
    }

}
