import {AppState} from "../../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, map, mergeMap, of, pipe} from "rxjs";
import {MessageSeverity} from "../../../shared";
import {Contract} from "../../../generated/models/contract";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {ContractRestService} from "../../rest/contract-rest.service";
import {ProjectStore} from "../../state";

export interface ContractState extends AppState {
    contractId: number | undefined;
}

export const initialState: ContractState = {
    contractId: undefined
}

export const ContractStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, messageService = inject(MessageService), contractRestService = inject(ContractRestService),
         projectStore = inject(ProjectStore)) => ({
            setContractId(contractId: number): void {
                patchState(store, {contractId: contractId});
            },
            changeStatus: rxMethod<{ contract: Contract }>(
                pipe(
                    mergeMap(({contract}) => {
                        return contractRestService.changeStatus(store.contractId()!, contract)
                            .pipe(
                                map(contract => {
                                    projectStore.setProjectNeedsRefresh();
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contract status changed.`,
                                        detail: `Status of contract with id: ${contract.id} was updated.`
                                    });
                                }),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error changing contract status.`,
                                        detail: `There was a problem with changing contract status.`
                                    });
                                    return of(error);
                                })
                            )
                    })
                )
            ),
            update: rxMethod<{ contract: Contract }>(
                pipe(
                    mergeMap(({contract}) => {
                        return contractRestService.updateContract(store.contractId()!, contract)
                            .pipe(
                                map(contract => {
                                    projectStore.setProjectNeedsRefresh();
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contract updated.`,
                                        detail: `Contract with id: ${contract.id} was updated.`
                                    });
                                }),
                                catchError(error => {
                                    messageService.add({
                                        severity: MessageSeverity.ERROR,
                                        summary: `Error updating contract.`,
                                        detail: `There was a problem with updating contract data.`
                                    });
                                    return of(error);
                                })
                            )
                    })
                )
            ),

        }))
)
