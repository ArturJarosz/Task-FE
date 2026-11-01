import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {CostCategory} from "../../generated/models/cost-category";

export abstract class CostCategoryRestService {
    abstract getCostCategories(): Observable<CostCategory[]>;

    abstract createCostCategory(category: CostCategory): Observable<CostCategory>;

    abstract updateCostCategory(categoryId: number, category: CostCategory): Observable<CostCategory>;

    abstract deleteCostCategory(categoryId: number): Observable<void>;
}

@Injectable()
export class CostCategoryRestServiceImpl extends AbstractRestService implements CostCategoryRestService {
    private categoriesUrl: string = `${environment.baseUrl}/cost-categories`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getCostCategories(): Observable<CostCategory[]> {
        return this.httpClient.get<CostCategory[]>(this.categoriesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading cost categories`))
            );
    }

    createCostCategory(category: CostCategory): Observable<CostCategory> {
        return this.httpClient.post<CostCategory>(this.categoriesUrl, category)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error creating cost category`))
            );
    }

    updateCostCategory(categoryId: number, category: CostCategory): Observable<CostCategory> {
        return this.httpClient.put<CostCategory>(`${this.categoriesUrl}/${categoryId}`, category)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error renaming cost category with id ${categoryId}`))
            );
    }

    deleteCostCategory(categoryId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.categoriesUrl}/${categoryId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting cost category with id ${categoryId}`))
            );
    }
}
