import {ProjectContract} from "../model/project";
import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";

export abstract class ContractRestService {

    abstract rejectOffer(contractId: number, contract: ProjectContract): Observable<ProjectContract>;

    abstract makeNewOffer(contractId: number, contract: ProjectContract): Observable<ProjectContract>;

    abstract acceptOffer(contractId: number, contract: ProjectContract): Observable<ProjectContract>;

    abstract sign(contractId: number, contract: ProjectContract): Observable<ProjectContract>;

    abstract terminate(contractId: number, contract: ProjectContract): Observable<ProjectContract>;

    abstract resume(contractId: number, contract: ProjectContract): Observable<ProjectContract>;

    abstract complete(contractId: number, contract: ProjectContract): Observable<ProjectContract>;
}

@Injectable()
export class ContractRestServiceImpl extends AbstractRestService implements ContractRestService {
    private contractUrl: string = `${environment.baseUrl}/contracts`

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    acceptOffer(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/accept-offer`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    complete(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/complete`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    makeNewOffer(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/new-offer`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    rejectOffer(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/reject`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    resume(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/resume`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    sign(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/sign`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    terminate(contractId: number, contract: ProjectContract): Observable<ProjectContract> {
        return this.httpClient.post<ProjectContract>(`${this.contractUrl}/${contractId}/terminate`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
