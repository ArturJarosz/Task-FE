import {HttpClient, HttpParams} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {catchError, Observable} from "rxjs";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostAmount} from "../../generated/models/company-cost-amount";
import {CompanyCostCharge} from "../../generated/models/company-cost-charge";
import {CompanyCostPayment} from "../../generated/models/company-cost-payment";

// Days from startDate to endDate (yyyy-MM-dd, both included)
export interface CompanyCostPeriod {
    startDate: string;
    endDate: string;
}

export abstract class CompanyCostRestService {
    // With a period, only the costs with a charge due in it or a payment made in it, each with its period figures
    abstract getCompanyCosts(period?: CompanyCostPeriod | null): Observable<CompanyCost[]>;

    abstract getCompanyCost(companyCostId: number): Observable<CompanyCost>;

    abstract createCompanyCost(companyCost: CompanyCost): Observable<CompanyCost>;

    abstract updateCompanyCost(companyCostId: number, companyCost: CompanyCost): Observable<CompanyCost>;

    abstract deleteCompanyCost(companyCostId: number): Observable<void>;

    abstract getCharges(companyCostId: number, year: number): Observable<CompanyCostCharge[]>;

    abstract createAmount(companyCostId: number, amount: CompanyCostAmount): Observable<CompanyCost>;

    abstract updateAmount(companyCostId: number, amountId: number, amount: CompanyCostAmount): Observable<CompanyCost>;

    abstract deleteAmount(companyCostId: number, amountId: number): Observable<CompanyCost>;

    abstract createPayment(companyCostId: number, payment: CompanyCostPayment): Observable<CompanyCostPayment>;

    abstract updatePayment(companyCostId: number, paymentId: number,
                           payment: CompanyCostPayment): Observable<CompanyCostPayment>;

    abstract deletePayment(companyCostId: number, paymentId: number): Observable<void>;
}

@Injectable()
export class CompanyCostRestServiceImpl extends AbstractRestService implements CompanyCostRestService {
    private readonly httpClient = inject(HttpClient);
    private readonly messageService = inject(MessageService);
    private readonly companyCostsUrl = `${environment.baseUrl}/company-costs`;

    getCompanyCosts(period?: CompanyCostPeriod | null): Observable<CompanyCost[]> {
        const params = period
            ? new HttpParams().set('startDate', period.startDate).set('endDate', period.endDate)
            : undefined;
        return this.httpClient.get<CompanyCost[]>(this.companyCostsUrl, {params})
            .pipe(catchError(error => this.handleError(error, this.messageService, `Error loading company costs`)));
    }

    getCompanyCost(companyCostId: number): Observable<CompanyCost> {
        return this.httpClient.get<CompanyCost>(`${this.companyCostsUrl}/${companyCostId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error loading company cost with id ${companyCostId}`)));
    }

    createCompanyCost(companyCost: CompanyCost): Observable<CompanyCost> {
        return this.httpClient.post<CompanyCost>(this.companyCostsUrl, companyCost)
            .pipe(catchError(error => this.handleError(error, this.messageService, `Error creating company cost`)));
    }

    updateCompanyCost(companyCostId: number, companyCost: CompanyCost): Observable<CompanyCost> {
        return this.httpClient.put<CompanyCost>(`${this.companyCostsUrl}/${companyCostId}`, companyCost)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error updating company cost with id ${companyCostId}`)));
    }

    deleteCompanyCost(companyCostId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.companyCostsUrl}/${companyCostId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error deleting company cost with id ${companyCostId}`)));
    }

    getCharges(companyCostId: number, year: number): Observable<CompanyCostCharge[]> {
        return this.httpClient.get<CompanyCostCharge[]>(`${this.companyCostsUrl}/${companyCostId}/charges`,
            {params: new HttpParams().set('year', year)})
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error loading charges of company cost with id ${companyCostId}`)));
    }

    createAmount(companyCostId: number, amount: CompanyCostAmount): Observable<CompanyCost> {
        return this.httpClient.post<CompanyCost>(`${this.companyCostsUrl}/${companyCostId}/amounts`, amount)
            .pipe(catchError(error => this.handleError(error, this.messageService, `Error changing amount`)));
    }

    updateAmount(companyCostId: number, amountId: number, amount: CompanyCostAmount): Observable<CompanyCost> {
        return this.httpClient.put<CompanyCost>(`${this.companyCostsUrl}/${companyCostId}/amounts/${amountId}`, amount)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error updating amount with id ${amountId}`)));
    }

    deleteAmount(companyCostId: number, amountId: number): Observable<CompanyCost> {
        return this.httpClient.delete<CompanyCost>(`${this.companyCostsUrl}/${companyCostId}/amounts/${amountId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error deleting amount with id ${amountId}`)));
    }

    createPayment(companyCostId: number, payment: CompanyCostPayment): Observable<CompanyCostPayment> {
        return this.httpClient.post<CompanyCostPayment>(`${this.companyCostsUrl}/${companyCostId}/payments`, payment)
            .pipe(catchError(error => this.handleError(error, this.messageService, `Error paying charge`)));
    }

    updatePayment(companyCostId: number, paymentId: number,
                  payment: CompanyCostPayment): Observable<CompanyCostPayment> {
        return this.httpClient.put<CompanyCostPayment>(
            `${this.companyCostsUrl}/${companyCostId}/payments/${paymentId}`, payment)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error updating payment with id ${paymentId}`)));
    }

    deletePayment(companyCostId: number, paymentId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.companyCostsUrl}/${companyCostId}/payments/${paymentId}`)
            .pipe(catchError(error => this.handleError(error, this.messageService,
                `Error deleting payment`)));
    }
}
