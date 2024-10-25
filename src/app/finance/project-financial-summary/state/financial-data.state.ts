import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {FinancialRestService} from "../rest/financial-rest.service";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";

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
    withMethods((store, financialRestService = inject(FinancialRestService)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() != projectId) {
                this.setProjectFinancialDataNeedsUpdate();
            }
            patchState(store, {projectId: projectId})
        },
        setProjectFinancialDataNeedsUpdate() {
            patchState(store, {projectFinancialSummaryNeedsRefresh: true})
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
                                })
                            )
                    }
                    return of(store.projectFinancialSummary());
                })
            )
        )
    }))
)
