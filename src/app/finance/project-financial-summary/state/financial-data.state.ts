import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {FinancialRestService} from "../rest/financial-rest.service";
import {FinancialReportStore} from "../../../financial-report/state/financial-report.state";
import {DashboardStore} from "../../../dashboard/state/dashboard.state";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";

export interface FinancialDataState {
    projectId: number | undefined,
    projectFinancialSummary: TotalProjectFinancialSummary | null,
    projectFinancialSummaryNeedsRefresh: boolean
}

export const initialState: FinancialDataState = {
    projectId: undefined,
    projectFinancialSummary: null,
    projectFinancialSummaryNeedsRefresh: true
}

export const FinancialDataStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, financialRestService = inject(FinancialRestService),
                 financialReportStore = inject(FinancialReportStore), dashboardStore = inject(DashboardStore)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() != projectId) {
                this.setProjectSummaryNeedsRefresh();
            }
            patchState(store, {projectId: projectId})
        },
        // Another project is shown: its summary is needed, but nothing changed
        setProjectSummaryNeedsRefresh() {
            patchState(store, {projectFinancialSummaryNeedsRefresh: true})
        },
        // Money changed: the project's summary and both financial reports no longer match it
        setProjectFinancialDataNeedsUpdate() {
            this.setProjectSummaryNeedsRefresh();
            financialReportStore.setReportNeedsRefresh();
            dashboardStore.setReportNeedsRefresh();
        },
        loadProjectFinancialSummary: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.projectFinancialSummaryNeedsRefresh()) {
                        return financialRestService.getProjectFinancialDataSummary(store.projectId()!)
                            .pipe(
                                tap(projectFinancialSummary => {
                                    patchState(store, {
                                        projectFinancialSummary: projectFinancialSummary,
                                        projectFinancialSummaryNeedsRefresh: false
                                    });
                                }),
                                catchError(() => EMPTY)
                            )
                    }
                    return of(store.projectFinancialSummary());
                })
            )
        )
    }))
)
