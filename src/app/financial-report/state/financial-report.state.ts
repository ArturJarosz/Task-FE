import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";
import {FinancialReportRestService} from "../rest/financial-report-rest.service";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {pipe, switchMap, tap} from "rxjs";
import {toTimeZoneString} from "../../shared/utils/date-utils";

export interface FinancialReportState {
    financialReport: FinancialReport | null;
    startDate: Date;
    endDate: Date;
    periodType: PeriodType;
    loading: boolean;
}

const currentYear = new Date().getFullYear();

export const initialState: FinancialReportState = {
    financialReport: null,
    startDate: new Date(currentYear, 0, 1),
    endDate: new Date(),
    periodType: PeriodType.MONTHLY,
    loading: false
}

export const FinancialReportStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, financialReportRestService = inject(FinancialReportRestService)) => ({
        setDateRange(startDate: Date, endDate: Date) {
            patchState(store, {startDate, endDate});
        },
        setPeriodType(periodType: PeriodType) {
            patchState(store, {periodType});
        },
        loadReport: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {loading: true})),
                switchMap(() => {
                    const startDate = toTimeZoneString(store.startDate())!;
                    const endDate = toTimeZoneString(store.endDate())!;
                    return financialReportRestService.getFinancialReport(startDate, endDate, store.periodType())
                        .pipe(
                            tap(financialReport => {
                                patchState(store, {
                                    financialReport,
                                    loading: false
                                });
                            })
                        );
                })
            )
        )
    }))
)
