import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {catchError, Observable} from "rxjs";
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";

export abstract class SupplyRestService {
    abstract getProjectSuppliesData(projectId: number): Observable<SupplyProjectData>;
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
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
