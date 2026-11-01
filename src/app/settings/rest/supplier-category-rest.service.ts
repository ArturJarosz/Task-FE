import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {SupplierCategory} from "../../generated/models/supplier-category";

export abstract class SupplierCategoryRestService {
    abstract getSupplierCategories(): Observable<SupplierCategory[]>;

    abstract createSupplierCategory(category: SupplierCategory): Observable<SupplierCategory>;

    abstract updateSupplierCategory(categoryId: number, category: SupplierCategory): Observable<SupplierCategory>;

    abstract deleteSupplierCategory(categoryId: number): Observable<void>;
}

@Injectable()
export class SupplierCategoryRestServiceImpl extends AbstractRestService implements SupplierCategoryRestService {
    private categoriesUrl: string = `${environment.baseUrl}/supplier-categories`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getSupplierCategories(): Observable<SupplierCategory[]> {
        return this.httpClient.get<SupplierCategory[]>(this.categoriesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading supplier categories`))
            );
    }

    createSupplierCategory(category: SupplierCategory): Observable<SupplierCategory> {
        return this.httpClient.post<SupplierCategory>(this.categoriesUrl, category)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error creating supplier category`))
            );
    }

    updateSupplierCategory(categoryId: number, category: SupplierCategory): Observable<SupplierCategory> {
        return this.httpClient.put<SupplierCategory>(`${this.categoriesUrl}/${categoryId}`, category)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error renaming supplier category with id ${categoryId}`))
            );
    }

    deleteSupplierCategory(categoryId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.categoriesUrl}/${categoryId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting supplier category with id ${categoryId}`))
            );
    }
}
