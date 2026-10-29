import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {computed, inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {catchError, EMPTY, filter, pipe, switchMap, tap} from "rxjs";
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";
import {UserConfigurationName} from "../../generated/models/user-configuration-name";
import {FinancialReportRestService} from "../../financial-report/rest/financial-report-rest.service";
import {MessageSeverity} from "../../shared/message";
import {UserRestService} from "../../shared/user/rest/user-rest.service";
import {UserStore} from "../../shared/user/state";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {DashboardLayout, DEFAULT_DASHBOARD_LAYOUT, parseDashboardLayout, serializeDashboardLayout} from "../layout/dashboard-layout";

// Years shown by the "Annually" chart view, the current one included
const ANNUAL_RANGE_YEARS = 5;

export interface DashboardState {
    report: FinancialReport | null;
    periodType: PeriodType;
    loading: boolean;
    loadFailed: boolean;
    // Layout being edited; null outside edit mode
    draftLayout: DashboardLayout | null;
    layoutSaving: boolean;
}

export const initialState: DashboardState = {
    report: null,
    periodType: PeriodType.MONTHLY,
    loading: false,
    loadFailed: false,
    draftLayout: null,
    layoutSaving: false,
}

// Kept apart from FinancialReportStore so the dashboard never changes the report page's filters.
// The report is reloaded every time the dashboard opens, because any finance change elsewhere affects it.
export const DashboardStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed((store, userStore = inject(UserStore)) => ({
        // The user's saved layout (USER_CONFIGURATION DASHBOARD_LAYOUT), or the default one when there is none
        layout: computed(() => parseDashboardLayout(userStore.configurations()
            ?.find(configuration => configuration.name === UserConfigurationName.DASHBOARD_LAYOUT)?.value)
            ?? DEFAULT_DASHBOARD_LAYOUT),
        // The user's settings load once after login; until then the saved layout is unknown
        layoutLoading: computed(() => userStore.configurations() === null && !userStore.configurationsLoadFailed()),
        editing: computed(() => store.draftLayout() !== null),
    })),
    withMethods((store, financialReportRestService = inject(FinancialReportRestService),
                 userRestService = inject(UserRestService), userStore = inject(UserStore),
                 messageService = inject(MessageService)) => ({
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
        startEditing() {
            patchState(store, {draftLayout: store.layout()});
        },
        updateDraft(draftLayout: DashboardLayout) {
            patchState(store, {draftLayout});
        },
        resetDraft() {
            patchState(store, {draftLayout: DEFAULT_DASHBOARD_LAYOUT});
        },
        cancelEditing() {
            patchState(store, {draftLayout: null, layoutSaving: false});
        },
        saveLayout: rxMethod<{}>(
            pipe(
                filter(() => store.draftLayout() !== null),
                tap(() => patchState(store, {layoutSaving: true})),
                switchMap(() => userRestService.updateCurrentUserConfiguration(UserConfigurationName.DASHBOARD_LAYOUT,
                    serializeDashboardLayout(store.draftLayout()!))
                    .pipe(
                        tap(saved => {
                            userStore.setConfiguration(saved);
                            patchState(store, {draftLayout: null, layoutSaving: false});
                            messageService.add({severity: MessageSeverity.SUCCESS, summary: 'Dashboard saved'});
                        }),
                        // The REST service already shows the error toast; the draft stays so the user can retry or cancel
                        catchError(() => {
                            patchState(store, {layoutSaving: false});
                            return EMPTY;
                        })
                    ))
            )
        ),
    }))
)
