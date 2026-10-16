import {AppState} from "../../state/app.store";
import {Contractor} from "../../generated/models/contractor";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {ContractorRestService} from "../rest/contractor-rest.service";
import {inject} from "@angular/core";
import {MessageSeverity} from "../../shared";
import {MessageService} from "primeng/api";
import {ContractorContractorJobsData} from "../../generated/models/contractor-contractor-jobs-data";

export interface ContractorState extends AppState {
    contractors: Contractor[];
    contractor: Contractor | null;
    contractorId: number | undefined;
    contractorsNeedRefresh: boolean;
    contractorNeedsRefresh: boolean
    contractorJobsData: ContractorContractorJobsData;
    contractorJobsDataNeedRefresh: boolean;
    contractorLoadFailed: boolean;
}

export const initialState: ContractorState = {
    contractors: [],
    contractor: null,
    contractorId: undefined,
    contractorsNeedRefresh: true,
    contractorNeedsRefresh: true,
    contractorJobsData: {},
    contractorJobsDataNeedRefresh: true,
    contractorLoadFailed: false,
}

export const ContractorStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, contractorRestService = inject(ContractorRestService), messageService = inject(MessageService)) => ({
            setContractorId(contractorId: number) {
                if (store.contractorId() !== contractorId) {
                    this.setContractorNeedsRefresh();
                    this.setContractorJobsDataNeedRefresh();
                    // Drop the previous contractor's jobs so they don't show while the new ones load
                    patchState(store, {contractorJobsData: {}});
                }
                patchState(store, {contractorId: contractorId});
            },
            setContractorNeedsRefresh() {
                patchState(store, {contractorNeedsRefresh: true});
            },
            setContractorsNeedRefresh() {
                patchState(store, {contractorsNeedRefresh: true});
            },
            setContractorJobsDataNeedRefresh() {
                patchState(store, {contractorJobsDataNeedRefresh: true});
            },
            loadContractors: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        if (store.contractorsNeedRefresh()) {
                            return contractorRestService.getContractors()
                                .pipe(
                                    tap(contractors => patchState(store, {
                                        contractors: contractors,
                                        contractorsNeedRefresh: false
                                    })),
                                    catchError(() => EMPTY)
                                )
                        }
                        return of({});
                    })
                )
            ),
            loadContractor: rxMethod<{}>(
                pipe(
                    tap(() => patchState(store, {contractorLoadFailed: false})),
                    switchMap(() => {
                        if (store.contractorNeedsRefresh()) {
                            return contractorRestService.getContractor(store.contractorId()!)
                                .pipe(
                                    tap(contractor => patchState(store, {
                                        contractor: contractor,
                                        contractorNeedsRefresh: false
                                    })),
                                    // The REST service already shows the error toast; keep the stream alive for the next load
                                    catchError(() => {
                                        patchState(store, {contractorLoadFailed: true});
                                        return EMPTY;
                                    })
                                )
                        }
                        return of({});
                    })
                )
            ),
            createContractor: rxMethod<{ contractor: Contractor }>(
                pipe(
                    switchMap(({contractor}) => {
                        return contractorRestService.createContractor(contractor)
                            .pipe(
                                tap(contractor => {
                                    patchState(store, {contractorsNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `New contractor created`,
                                        detail: `New contractor '${contractor.name}' was created.`,
                                    });
                                }),
                                catchError(() => EMPTY)
                            )
                    })
                )
            ),
            updateContractor: rxMethod<{ contractor: Contractor }>(
                pipe(
                    switchMap(({contractor}) => {
                        return contractorRestService.updateContractor(store.contractorId()!, contractor)
                            .pipe(
                                tap(contractor => {
                                    patchState(store, {
                                        contractor: contractor,
                                        contractorsNeedRefresh: true,
                                        contractorNeedsRefresh: true
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contractor updated.`,
                                        detail: `Contractor '${contractor.name}' was updated.`,
                                    });
                                }),
                                catchError(() => EMPTY)
                            )
                    })
                )
            ),
            deleteContractor: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return contractorRestService.deleteContractor(store.contractorId()!)
                            .pipe(
                                tap(contractor => {
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contractor removed.`,
                                        detail: `Contractor with id ${store.contractorId()!} was removed.`,
                                    });
                                    patchState(store, {
                                        contractorsNeedRefresh: true,
                                        contractorId: undefined,
                                        contractor: null,
                                    });
                                }),
                                catchError(() => EMPTY)
                            )
                    })
                )
            ),
            loadContractorJobsData: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return contractorRestService.getContractorJobsData(store.contractorId()!)
                            .pipe(
                                tap(contractorJobsData => {
                                    patchState(store, {
                                        contractorJobsData: contractorJobsData,
                                        contractorJobsDataNeedRefresh: false,
                                    })
                                }),
                                catchError(() => EMPTY)
                            )
                    })
                )
            )
        }))
)
