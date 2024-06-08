import {environment} from "../../../../environments/environment";
import {Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";

export abstract class FinancialRestService {
    abstract getProjectFinancialDataSummary(projectId: number): Observable<TotalProjectFinancialSummary>
}

@Injectable()
export class FinancialRestServiceImpl extends AbstractRestService implements FinancialRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjectFinancialDataSummary(projectId: number): Observable<TotalProjectFinancialSummary> {
        return this.httpClient.get<TotalProjectFinancialSummary>(
            `${this.projectsUrl}/${projectId}/total-financial-summary`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
