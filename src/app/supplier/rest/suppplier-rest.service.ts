import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../environments/environment";
import {Supplier} from "../../generated/models/supplier";
import {SupplierSuppliesData} from "../../generated/models/supplier-supplies-data";

export abstract class SupplierRestService {
    abstract getSuppliers(): Observable<Supplier[]>;

    abstract getSupplier(supplierId: number): Observable<Supplier>;

    abstract createSupplier(supplier: Supplier): Observable<Supplier>;

    abstract deleteSupplier(supplierId: number): Observable<void>;

    abstract updateSupplier(supplierId: number, supplier: Supplier): Observable<Supplier>;

    abstract getSuppliesData(supplierId: number): Observable<SupplierSuppliesData>;
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
                catchError(error => this.handleError(error, this.messageService, `Error loading suppliers`))
            );
    }

    createSupplier(supplier: Supplier): Observable<Supplier> {
        return this.httpClient.post<Supplier>(this.supplierUrl, supplier)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error creating supplier`))
            )
    }

    deleteSupplier(supplierId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.supplierUrl}/${supplierId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting supplier with id ${supplierId}`))
            );
    }

    getSupplier(supplierId: number): Observable<Supplier> {
        return this.httpClient.get<Supplier>(`${this.supplierUrl}/${supplierId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading supplier with id ${supplierId}`))
            );
    }

    updateSupplier(supplierId: number, supplier: Supplier): Observable<Supplier> {
        return this.httpClient.put<Supplier>(`${this.supplierUrl}/${supplierId}`, supplier)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error updating supplier with id ${supplierId}`))
            );
    }

    getSuppliesData(supplierId: number): Observable<SupplierSuppliesData> {
        return this.httpClient.get<SupplierSuppliesData>(`${this.supplierUrl}/${supplierId}/supplies`)
            .pipe(
                    catchError(error => this.handleError(error, this.messageService,
                        `Error loading supplies data for supplier with id ${supplierId}`))
            )
    }
}
