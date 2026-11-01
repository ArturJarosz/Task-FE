import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {ContractorCategory} from "../../generated/models/contractor-category";

export abstract class ContractorCategoryRestService {
    abstract getContractorCategories(): Observable<ContractorCategory[]>;

    abstract createContractorCategory(category: ContractorCategory): Observable<ContractorCategory>;

    abstract updateContractorCategory(categoryId: number, category: ContractorCategory): Observable<ContractorCategory>;

    abstract deleteContractorCategory(categoryId: number): Observable<void>;
}

@Injectable()
export class ContractorCategoryRestServiceImpl extends AbstractRestService implements ContractorCategoryRestService {
    private categoriesUrl: string = `${environment.baseUrl}/contractor-categories`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getContractorCategories(): Observable<ContractorCategory[]> {
        return this.httpClient.get<ContractorCategory[]>(this.categoriesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading contractor categories`))
            );
    }

    createContractorCategory(category: ContractorCategory): Observable<ContractorCategory> {
        return this.httpClient.post<ContractorCategory>(this.categoriesUrl, category)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error creating contractor category`))
            );
    }

    updateContractorCategory(categoryId: number, category: ContractorCategory): Observable<ContractorCategory> {
        return this.httpClient.put<ContractorCategory>(`${this.categoriesUrl}/${categoryId}`, category)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error renaming contractor category with id ${categoryId}`))
            );
    }

    deleteContractorCategory(categoryId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.categoriesUrl}/${categoryId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting contractor category with id ${categoryId}`))
            );
    }
}
