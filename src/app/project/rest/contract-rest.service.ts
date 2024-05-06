import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {Contract} from "../../generated/models/contract";

export abstract class ContractRestService {

    abstract changeStatus(contractId: number, contract: Contract): Observable<Contract>;
}

@Injectable()
export class ContractRestServiceImpl extends AbstractRestService implements ContractRestService {
    private contractUrl: string = `${environment.baseUrl}/contracts`

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    changeStatus(contractId: number, contract: Contract): Observable<Contract> {
        return this.httpClient.post<Contract>(`${this.contractUrl}/${contractId}/status`, contract)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
