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
import {ContractorStore} from "../../../contractor/state";

export interface ContractorJobState {
    contractorJob: ContractorJob;
    contractorsJobsProjectData: ContractorJobProjectData;
    contractorJobsNeedRefresh: boolean;
    contractorJobNeedsRefresh: boolean;
    contractorJobId: number | undefined;
    projectId: number | undefined;
}

export const initialState: ContractorJobState = {
    contractorJob: {},
    contractorsJobsProjectData: {},
    contractorJobsNeedRefresh: true,
    contractorJobNeedsRefresh: true,
    contractorJobId: undefined,
    projectId: undefined,
}

export const ContractorJobStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, contractorJobRestService = inject(ContractorJobRestService), messageService = inject(MessageService),
         financialDataStore = inject(FinancialDataStore), contractorStore = inject(ContractorStore)) => ({
            setProjectId(projectId: number) {
                if (store.projectId() !== projectId) {
                    this.setContractorJobsNeedRefresh();
                }
                patchState(store, {projectId: projectId})
            },
            setContractorJobsNeedRefresh() {
                patchState(store, {contractorJobsNeedRefresh: true});
            },
            setContractorJobNeedsRefresh() {
                patchState(store, {contractorJobNeedsRefresh: true});
            },
            setContractorJobId(contractorJobId: number) {
                if (store.contractorJobId() !== contractorJobId) {
                    this.setContractorJobNeedsRefresh();
                }
                patchState(store, {contractorJobId: contractorJobId});
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
                                    financialDataStore.setProjectFinancialDataNeedsUpdate();
                                    contractorStore.setContractorsNeedRefresh();
                                    contractorStore.setContractorNeedsRefresh();
                                })
                            )
                    })
                )
            ),
            loadContractorJob: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        if (store.contractorJobNeedsRefresh() && store.projectId() && store.contractorJobId()) {
                            return contractorJobRestService.getContractorJob(store.projectId()!, store.contractorJobId()!)
                                .pipe(tap(contractorJob => patchState(store, {
                                    contractorJob: contractorJob,
                                    contractorJobNeedsRefresh: false
                                })));
                        }
                        return of(null);
                    })
                )
            ),
            updateContractorJob: rxMethod<{ contractorJob: ContractorJob }>(
                pipe(
                    switchMap(({contractorJob}) => {
                        return contractorJobRestService.updateContractorJob(store.projectId()!, store.contractorJobId()!, contractorJob)
                            .pipe(
                                tap(updatedContractorJob => {
                                    patchState(store, {
                                        contractorJob: updatedContractorJob,
                                        contractorJobsNeedRefresh: true
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: 'Contractor job updated',
                                        detail: `Contractor job ${updatedContractorJob.name} updated successfully.`
                                    });
                                    financialDataStore.setProjectFinancialDataNeedsUpdate();
                                    contractorStore.setContractorsNeedRefresh();
                                    contractorStore.setContractorNeedsRefresh();
                                    contractorStore.setContractorJobsDataNeedRefresh();
                                })
                            );
                    })
                )
            ),
            deleteContractorJob: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return contractorJobRestService.deleteContractorJob(store.projectId()!, store.contractorJobId()!)
                            .pipe(
                                tap(() => {
                                    patchState(store, {
                                        contractorJob: {},
                                        contractorJobsNeedRefresh: true
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: 'Contractor job deleted',
                                        detail: `Contractor job deleted successfully.`
                                    });
                                    financialDataStore.setProjectFinancialDataNeedsUpdate();
                                    contractorStore.setContractorsNeedRefresh();
                                    contractorStore.setContractorNeedsRefresh();
                                    contractorStore.setContractorJobsDataNeedRefresh();
                                })
                            );
                    })
                )
            ),
        }))
)
