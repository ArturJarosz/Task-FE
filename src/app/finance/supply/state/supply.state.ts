import {Supply} from "../../../generated/models/supply";
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {SupplyRestService} from "../rest/supply-rest.service";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../../shared";
import {FinancialDataStore} from "../../project-financial-summary/state/financial-data.state";
import {SupplierStore} from "../../../supplier/state";

export interface SupplyState {
    supply: Supply,
    supplies: Supply[];
    supplyProjectData: SupplyProjectData;
    suppliesNeedRefresh: boolean;
    projectId: number | undefined;
}

export const initialState: SupplyState = {
    supply: {},
    supplies: [],
    supplyProjectData: {},
    suppliesNeedRefresh: true,
    projectId: undefined
}

export const SupplyStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, supplyRestService = inject(SupplyRestService), messageService = inject(MessageService),
                 financialDataStore = inject(FinancialDataStore), supplierStore = inject(SupplierStore)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() !== projectId) {
                this.setSuppliesNeedRefresh();
            }
            patchState(store, {projectId: projectId});
        },
        setSuppliesNeedRefresh() {
            patchState(store, {suppliesNeedRefresh: true})
        },
        loadProjectSupplies: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.suppliesNeedRefresh()) {
                        return supplyRestService.getProjectSuppliesData(store.projectId()!)
                            .pipe(
                                tap(suppliesData => patchState(store, {
                                    supplyProjectData: suppliesData,
                                    supplies: suppliesData.supplies,
                                    suppliesNeedRefresh: false
                                }))
                            )
                    }
                    return of({});
                })
            )
        ),
        createSupply: rxMethod<{ supply: Supply }>(
            pipe(
                switchMap(({supply}) => {
                    return supplyRestService.createSupply(store.projectId()!, supply)
                        .pipe(
                            tap(createdSupply => {
                                patchState(store, {supply: createdSupply, suppliesNeedRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: `New supply created`,
                                    detail: `New supply ${createdSupply.name} was created successfully.`,
                                });
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                                supplierStore.setSuppliersNeedRefresh();
                                supplierStore.setSupplierNeedsRefresh();
                                supplierStore.setSuppliesDataNeedsRefresh();
                            })
                        )
                })
            )
        )
    }))
)
