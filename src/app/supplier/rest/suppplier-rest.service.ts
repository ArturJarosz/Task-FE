import {catchError, Observable} from "rxjs";
import {Supplier} from "../model/supplier";
import {Injectable} from "@angular/core";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../environments/environment";

export abstract class SupplierRestService {
    abstract getSuppliers(): Observable<Supplier[]>;
}

@Injectable()
export class SupplierRestServiceImpl extends AbstractRestService implements SupplierRestService {
    private supplierUrl: string = `${environment.baseUrl}/suppliers`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getSuppliers(): Observable<Supplier[]> {
        return this.httpClient.get<Supplier[]>(this.supplierUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
