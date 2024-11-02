import {Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";

export abstract class ContractorJobRestService {
    abstract getProjectContractorsJobsData(projectId: number): Observable<ContractorJobProjectData>
}

@Injectable()
export class ContractorJobRestServiceImpl extends AbstractRestService implements ContractorJobRestService {
    private projectUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjectContractorsJobsData(projectId: number): Observable<ContractorJobProjectData> {
        return this.httpClient.get<ContractorJobProjectData>(`${this.projectUrl}/${projectId}/contractor-jobs-data`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
