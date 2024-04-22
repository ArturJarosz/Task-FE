import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";
import {Contractor} from "../../generated/models/contractor";

export abstract class ContractorRestService {
    abstract getContractors(): Observable<Contractor[]>;
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
}
