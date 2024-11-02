import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {ContractorJobRestService} from "../rest/contractor-job-rest.service";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";

export interface ContractorJobState {
    contractorsJobsProjectData: ContractorJobProjectData;
    contractorJobsNeedRefresh: boolean;
    projectId: number | undefined;
}

export const initialState: ContractorJobState = {
    contractorsJobsProjectData: {},
    contractorJobsNeedRefresh: true,
    projectId: undefined,
}

export const ContractorJobStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, contractorJobRestService = inject(ContractorJobRestService)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() !== projectId) {
                this.setContractorJobsNeedRefresh();
            }
            patchState(store, {projectId: projectId})
        },
        setContractorJobsNeedRefresh() {
            patchState(store, {contractorJobsNeedRefresh: true});
        },
        loadContractorsJobsProjectData: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.contractorJobsNeedRefresh()) {
                        return contractorJobRestService.getProjectContractorsJobsData(store.projectId()!).pipe(
                            tap(contractorJobsProjectData => patchState(store, {
                                contractorsJobsProjectData: contractorJobsProjectData,
                                contractorJobsNeedRefresh: false,
                            }))
                        )
                    }
                    return of({});
                })
            )
        )
    }))
)
