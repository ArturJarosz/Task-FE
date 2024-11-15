import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {ContractorJobRestService} from "../rest/contractor-job-rest.service";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {ContractorJob} from "../../../generated/models/contractor-job";
import {MessageService} from "primeng/api";
import {FinancialDataStore} from "../../project-financial-summary/state/financial-data.state";
import {MessageSeverity} from "../../../shared";

export interface ContractorJobState {
    contractorJob: ContractorJob;
    contractorsJobsProjectData: ContractorJobProjectData;
    contractorJobsNeedRefresh: boolean;
    projectId: number | undefined;
}

export const initialState: ContractorJobState = {
    contractorJob: {},
    contractorsJobsProjectData: {},
    contractorJobsNeedRefresh: true,
    projectId: undefined,
}

export const ContractorJobStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, contractorJobRestService = inject(ContractorJobRestService), messageService = inject(MessageService),
         financialDataStore = inject(FinancialDataStore)) => ({
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
                            return contractorJobRestService.getProjectContractorsJobsData(store.projectId()!)
                                .pipe(
                                    tap(contractorJobsProjectData => patchState(store, {
                                        contractorsJobsProjectData: contractorJobsProjectData,
                                        contractorJobsNeedRefresh: false,
                                    }))
                                )
                        }
                        return of({});
                    })
                )
            ),
            createContractorJob: rxMethod<{ contractorJob: ContractorJob }>(
                pipe(
                    switchMap(({contractorJob}) => {
                        return contractorJobRestService.createContractorJob(store.projectId()!, contractorJob)
                            .pipe(
                                tap(createdContractorJob => {
                                    patchState(store,
                                        {contractorJob: createdContractorJob, contractorJobsNeedRefresh: true});
                                    messageService.add(
                                        {
                                            severity: MessageSeverity.INFO,
                                            summary: 'New contractor job created',
                                            detail: `New contractor ${createdContractorJob.name} job created successfully.`
                                        });
                                })
                            )
                    })
                )
            )
        }))
)
