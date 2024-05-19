import {AppState} from "../../state/app.store";
import {Contractor} from "../../generated/models/contractor";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {ContractorRestService} from "../rest/contractor-rest.service";
import {inject} from "@angular/core";
import {MessageSeverity} from "../../shared";
import {MessageService} from "primeng/api";

export interface ContractorState extends AppState {
    contractors: Contractor[];
    contractor: Contractor | null;
    contractorId: number | undefined;
    contractorsNeedRefresh: boolean;
    contractorNeedsRefresh: boolean
}

export const initialState: ContractorState = {
    contractors: [],
    contractor: null,
    contractorId: undefined,
    contractorsNeedRefresh: true,
    contractorNeedsRefresh: true
}

export const ContractorStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, contractorRestService = inject(ContractorRestService), messageService = inject(MessageService)) => ({
            setContractorId(contractorId: number) {
                patchState(store, {contractorId: contractorId});
            },
            loadContractors: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return contractorRestService.getContractors()
                            .pipe(
                                tap(contractors => patchState(store,
                                    {contractors: contractors, contractorsNeedRefresh: false})),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error loading contractors.`,
                                        detail: `There was a problem with loading contractors.`,
                                    });
                                    return of(error);
                                })
                            )
                    })
                )
            ),
            loadContractor: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        return contractorRestService.getContractor(store.contractorId()!)
                            .pipe(
                                tap(contractor => patchState(store,
                                    {contractor: contractor, contractorNeedsRefresh: false})),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error loading contractor.`,
                                        detail: `There was a problem with loading contractor with id: ${store.contractorId()}.`,
                                    });
                                    return of(error);
                                })
                            )
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
                                        detail: `New contractor was created.`,
                                    });
                                })
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
                                    patchState(store, {contractor: contractor, contractorsNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contractor updated.`,
                                        detail: `Contractor ${contractor.name} was updated.`,
                                    });
                                })
                            )
                    })
                )
            ),
            deleteContractor: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        console.log("removing contractor store");
                        return contractorRestService.deleteContractor(store.contractorId()!)
                            .pipe(
                                tap(contractor => {
                                    patchState(store, {contractorsNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contractor removed.`,
                                        detail: `Contractor with id ${store.contractorId()!} was removed.`,
                                    });
                                })
                            )
                    })
                )
            )
        }))
)
