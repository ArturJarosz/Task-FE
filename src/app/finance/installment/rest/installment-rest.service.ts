import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, Observable} from "rxjs";
import {MessageService} from "primeng/api";
import {environment} from "../../../../environments/environment";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {Installment} from "../../../generated/models/installment";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";

export abstract class InstallmentRestService {
    abstract getProjectInstallmentData(projectId: number): Observable<InstallmentProjectData>;
    abstract getInstallment(projectId: number, installmentId: number): Observable<Installment>;
    abstract createInstallment(projectId: number, installment: Installment): Observable<Installment>;
    abstract updateInstallment(projectId: number, installmentId: number, installment: Installment): Observable<Installment>;
}

@Injectable()
export class InstallmentRestServiceImpl extends AbstractRestService implements InstallmentRestService {
    private readonly httpClient = inject(HttpClient);
    private readonly messageService = inject(MessageService);
    private readonly projectsUrl = `${environment.baseUrl}/projects`;

    getProjectInstallmentData(projectId: number): Observable<InstallmentProjectData> {
        return this.httpClient.get<InstallmentProjectData>(`${this.projectsUrl}/${projectId}/installments-data`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error getting installment project data for project with id: ${projectId}`)));
    }

    getInstallment(projectId: number, installmentId: number): Observable<Installment> {
        return this.httpClient.get<Installment>(`${this.projectsUrl}/${projectId}/installments/${installmentId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error getting installment with id: ${installmentId}`)));
    }

    createInstallment(projectId: number, installment: Installment): Observable<Installment> {
        return this.httpClient.post<Installment>(
            `${this.projectsUrl}/${projectId}/stages/${installment.stageId}/installments`, installment)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error creating installment for project with id: ${projectId}`)));
    }

    updateInstallment(projectId: number, installmentId: number, installment: Installment): Observable<Installment> {
        return this.httpClient.put<Installment>(
            `${this.projectsUrl}/${projectId}/installments/${installmentId}`, installment)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error updating installment with id: ${installmentId} for stage: ${installment.stageName}`)));
    }
}
