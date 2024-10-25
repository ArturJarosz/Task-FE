import {AppState} from "../../../state/app.store";
import {Cost} from "../../../generated/models/cost";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {CostRestService} from "../rest/cost-rest.service";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../../shared";
import {FinancialDataStore} from "../../project-financial-summary/state/financial-data.state";

export interface CostState extends AppState {
    cost: Cost | null,
    costs: Cost[];
    costsNeedRefresh: boolean,
    costNeedsRefresh: boolean,
    costId: number | undefined,
    projectId: number | undefined
}

export const initialState: CostState = {
    cost: null,
    costs: [],
    costsNeedRefresh: true,
    costNeedsRefresh: true,
    costId: undefined,
    projectId: undefined
}

export const CostStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, costRestService = inject(CostRestService), financialDataStore = inject(FinancialDataStore),
                 messageService = inject(MessageService)) => ({
        setCostId(costId: number) {
            if (store.costId() !== costId) {
                this.setCostNeedRefresh();
            }
            patchState(store, {costId: costId})
        },
        setProjectId(projectId: number) {
            if (store.projectId() !== projectId) {
                this.setCostsNeedRefresh();
            }
            patchState(store, {projectId: projectId});
        },
        setCostsNeedRefresh() {
            patchState(store, {costsNeedRefresh: true})
        },
        setCostNeedRefresh() {
            patchState(store, {costNeedsRefresh: true})
        },
        loadCost: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.costNeedsRefresh()) {
                        return costRestService.getCost(store.projectId()!, store.costId()!)
                            .pipe(
                                tap(cost => patchState(store,
                                    {
                                        cost: cost,
                                        costNeedsRefresh: false
                                    }))
                            )
                    }
                    return of({});
                })
            )
        ),
        loadCosts: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.costsNeedRefresh()) {
                        return costRestService.getProjectCosts(store.projectId()!)
                            .pipe(
                                tap(costs => patchState(store, {
                                    costs: costs,
                                    costsNeedRefresh: false
                                }))
                            )
                    }
                    return of({});
                })
            )
        ),
        createCost: rxMethod<{ cost: Cost }>(
            pipe(
                switchMap(({cost}) => {
                    return costRestService.createCost(store.projectId()!, cost)
                        .pipe(
                            tap(cost => {
                                patchState(store, {cost: cost, costsNeedRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: `New cost created`,
                                    detail: `New cost for project with id ${store.projectId()} was created.`,
                                });
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                            })
                        )
                })
            )
        ),

    }))
)
