import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";

export abstract class FinancialReportRestService {
    abstract getFinancialReport(startDate: string, endDate: string, periodType: PeriodType): Observable<FinancialReport>;
}

@Injectable()
export class FinancialReportRestServiceImpl extends AbstractRestService implements FinancialReportRestService {
    private financialDataUrl: string = `${environment.baseUrl}/financial-data`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getFinancialReport(startDate: string, endDate: string, periodType: PeriodType): Observable<FinancialReport> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate)
            .set('periodType', periodType);

        return this.httpClient.get<FinancialReport>(this.financialDataUrl, {params})
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading financial report`))
            );
    }
}
