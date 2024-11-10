import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {catchError, Observable} from "rxjs";
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {Supply} from "../../../generated/models/supply";

export abstract class SupplyRestService {
    abstract getProjectSuppliesData(projectId: number): Observable<SupplyProjectData>;

    abstract createSupply(projectId: number, supply: Supply): Observable<Supply>;
}

@Injectable()
export class SupplyRestServiceImpl extends AbstractRestService implements SupplyRestService {
    private projectUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjectSuppliesData(projectId: number): Observable<SupplyProjectData> {
        return this.httpClient.get<SupplyProjectData>(`${this.projectUrl}/${projectId}/supplies-data`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error getting project supplies data for project with id: ${projectId}`))
            );
    }

    createSupply(projectId: number, supply: Supply): Observable<Supply> {
        return this.httpClient.post<Supply>(`${this.projectUrl}/${projectId}/supplies`, supply)
            .pipe(catchError(
                error => this.handleError(error, this.messageService, `Error creating supply for project with id: ${projectId}`)));
    }

}
