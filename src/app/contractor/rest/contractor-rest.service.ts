import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";
import {Contractor} from "../../generated/models/contractor";

export abstract class ContractorRestService {
    abstract getContractors(): Observable<Contractor[]>;

    abstract createContractor(contractor: Contractor): Observable<Contractor>;

    abstract getContractor(contractorId: number): Observable<Contractor>;

    abstract updateContractor(contractorId: number, contractor: Contractor): Observable<Contractor>;

    abstract deleteContractor(contractorId: number): Observable<void>;
}

@Injectable()
export class ContractorRestServiceImpl extends AbstractRestService implements ContractorRestService {
    private contractorUrl: string = `${environment.baseUrl}/contractors`

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getContractors(): Observable<Contractor[]> {
        return this.httpClient.get<Contractor[]>(this.contractorUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    createContractor(contractor: Contractor): Observable<Contractor> {
        return this.httpClient.post<Contractor>(this.contractorUrl, contractor)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    getContractor(contractorId: number): Observable<Contractor> {
        return this.httpClient.get<Contractor>(`${this.contractorUrl}/${contractorId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    updateContractor(contractorId: number, contractor: Contractor): Observable<Contractor> {
        return this.httpClient.put<Contractor>(`${this.contractorUrl}/${contractorId}`, contractor)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    deleteContractor(contractorId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.contractorUrl}/${contractorId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
