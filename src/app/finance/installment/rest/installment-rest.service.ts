import {catchError, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {Injectable} from "@angular/core";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {Installment} from "../../../generated/models/installment";

export abstract class InstallmentRestService {
    abstract getProjectInstallmentData(projectId: number): Observable<InstallmentProjectData>;

    abstract createInstallment(projectId: number, installment: Installment): Observable<Installment>;

    abstract getInstallment(projectId: number, installmentId: number): Observable<Installment>;

    abstract updateInstallment(projectId: number, installmentId: number,
                               installment: Installment): Observable<Installment>;
}

@Injectable()
export class InstallmentRestServiceImpl extends AbstractRestService implements InstallmentRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getProjectInstallmentData(projectId: number): Observable<InstallmentProjectData> {
        return this.httpClient.get<InstallmentProjectData>(`${this.projectsUrl}/${projectId}/installments-data`)
            .pipe(
                catchError(error => this.handleError(error,
                    this.messageService, `Error getting installment project data for project with id: ${projectId}`))
            );
    }

    createInstallment(projectId: number, installment: Installment): Observable<Installment> {
        return this.httpClient.post<Installment>(
            `${this.projectsUrl}/${projectId}/stages/${installment.stageId}/installments`, installment)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error creating installment for project with id: ${projectId}.`))
            )
    }

    getInstallment(projectId: number, installmentId: number): Observable<Installment> {
        return this.httpClient.get<Installment>(`${this.projectsUrl}/${projectId}/installments/${installmentId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error getting installment with id: ${installmentId}`))
            )
    }

    updateInstallment(projectId: number, installmentId: number, installment: Installment): Observable<Installment> {
        return this.httpClient.put<Installment>(`${this.projectsUrl}/${projectId}/installments/${installmentId}`,
            installment)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error updating installment with id: ${installmentId} for stage: ${installment.stageName}.`))
            )
    }

}
