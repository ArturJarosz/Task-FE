import {catchError, Observable} from "rxjs";
import {Installment} from "../../../generated/models/installment";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {Injectable} from "@angular/core";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";

export abstract class InstallmentRestService {
    abstract getInstallmentsForProject(projectId: number): Observable<InstallmentProjectData>;
}

@Injectable()
export class InstallmentRestServiceImpl extends AbstractRestService implements InstallmentRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getInstallmentsForProject(projectId: number): Observable<InstallmentProjectData> {
        return this.httpClient.get<InstallmentProjectData>(`${this.projectsUrl}/${projectId}/installments`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
