import {Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../../shared/rest/abstract-rest.service";
import {ContractorJob} from "../../../generated/models/contractor-job";

export abstract class ContractorJobRestService {
    abstract getProjectContractorsJobsData(projectId: number): Observable<ContractorJobProjectData>;

    abstract createContractorJob(projectId: number, contractorJob: ContractorJob): Observable<ContractorJob>;

    abstract getContractorJob(projectId: number, contractorJobId: number): Observable<ContractorJob>;

    abstract updateContractorJob(projectId: number, contractorJobId: number, contractorJob: ContractorJob): Observable<ContractorJob>;

    abstract deleteContractorJob(projectId: number, contractorJobId: number): Observable<void>;
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
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading contractor jobs data for project with id: ${projectId}`))
            );
    }

    createContractorJob(projectId: number, contractorJob: ContractorJob): Observable<ContractorJob> {
        return this.httpClient.post<ContractorJob>(`${this.projectUrl}/${projectId}/contractor-jobs`, contractorJob)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error creating contractor job for project with id: ${projectId}`))
            );
    }

    getContractorJob(projectId: number, contractorJobId: number): Observable<ContractorJob> {
        return this.httpClient.get<ContractorJob>(`${this.projectUrl}/${projectId}/contractor-jobs/${contractorJobId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error loading contractor job with id: ${contractorJobId}`)));
    }

    updateContractorJob(projectId: number, contractorJobId: number, contractorJob: ContractorJob): Observable<ContractorJob> {
        return this.httpClient.put<ContractorJob>(`${this.projectUrl}/${projectId}/contractor-jobs/${contractorJobId}`, contractorJob)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error updating contractor job with id: ${contractorJobId}`)));
    }

    deleteContractorJob(projectId: number, contractorJobId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.projectUrl}/${projectId}/contractor-jobs/${contractorJobId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error deleting contractor job with id: ${contractorJobId}`)));
    }

}
