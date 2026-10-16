import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {inject} from "@angular/core";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";
import {FinancialReportRestService} from "../../financial-report/rest/financial-report-rest.service";
import {toTimeZoneString} from "../../shared/utils/date-utils";

// Years shown by the "Annually" chart view, the current one included
const ANNUAL_RANGE_YEARS = 5;

export interface DashboardState {
    report: FinancialReport | null;
    periodType: PeriodType;
    loading: boolean;
    loadFailed: boolean;
}

export const initialState: DashboardState = {
    report: null,
    periodType: PeriodType.MONTHLY,
    loading: false,
    loadFailed: false,
}

// Kept apart from FinancialReportStore so the dashboard never changes the report page's filters.
// The report is reloaded every time the dashboard opens, because any finance change elsewhere affects it.
export const DashboardStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, financialReportRestService = inject(FinancialReportRestService)) => ({
        setPeriodType(periodType: PeriodType) {
            patchState(store, {periodType});
        },
        loadReport: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {loading: true, loadFailed: false})),
                switchMap(() => {
                    const today = new Date();
                    const firstYear = store.periodType() === PeriodType.YEARLY
                        ? today.getFullYear() - ANNUAL_RANGE_YEARS + 1
                        : today.getFullYear();
                    return financialReportRestService.getFinancialReport(toTimeZoneString(new Date(firstYear, 0, 1))!,
                        toTimeZoneString(today)!, store.periodType())
                        .pipe(
                            tap(report => patchState(store, {report, loading: false})),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {loading: false, loadFailed: true});
                                return EMPTY;
                            })
                        );
                })
            )
        ),
    }))
)
