import {Supply} from "../../../generated/models/supply";
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {SupplyRestService} from "../rest/supply-rest.service";
import {inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";

export interface SupplyState {
    supplies: Supply[];
    supplyProjectData: SupplyProjectData;
    suppliesNeedRefresh: boolean;
    projectId: number | undefined;
}

export const initialState: SupplyState = {
    supplies: [],
    supplyProjectData: {},
    suppliesNeedRefresh: true,
    projectId: undefined
}

export const SupplyStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, supplyRestService = inject(SupplyRestService)) => ({
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
                switchMap(()=>{
                    if(store.suppliesNeedRefresh()) {
                        return supplyRestService.getProjectSuppliesData(store.projectId()!).pipe(
                            tap(suppliesData => patchState(store, {
                                supplyProjectData: suppliesData,
                                supplies: suppliesData.supplies,
                                suppliesNeedRefresh: true
                            }))
                        )
                    }
                    return of({});
                })
            )
        )
    }))
)
