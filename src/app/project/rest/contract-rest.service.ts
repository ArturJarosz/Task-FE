import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {Contract} from "../../generated/models/contract";

export abstract class ContractRestService {

    abstract rejectOffer(contractId: number, contract: Contract): Observable<Contract>;

    abstract makeNewOffer(contractId: number, contract: Contract): Observable<Contract>;

    abstract acceptOffer(contractId: number, contract: Contract): Observable<Contract>;

    abstract sign(contractId: number, contract: Contract): Observable<Contract>;

    abstract terminate(contractId: number, contract: Contract): Observable<Contract>;

    abstract resume(contractId: number, contract: Contract): Observable<Contract>;

    abstract complete(contractId: number, contract: Contract): Observable<Contract>;
}

@Injectable()
export class ContractRestServiceImpl extends AbstractRestService implements ContractRestService {
    private contractUrl: string = `${environment.baseUrl}/contracts`

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    acceptOffer(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/accept-offer`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    complete(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/complete`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    makeNewOffer(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/new-offer`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    rejectOffer(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/reject`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    resume(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/resume`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    sign(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/sign`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    terminate(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/terminate`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
