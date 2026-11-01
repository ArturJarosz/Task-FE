import {AppState} from "../../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, mergeMap, pipe, tap} from "rxjs";
import {MessageSeverity} from "../../../shared";
import {Contract} from "../../../generated/models/contract";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {ContractRestService} from "../../rest/contract-rest.service";
import {ProjectStore} from "../../state";
import {InstallmentStore} from "../../../finance/installment/state/installment.state";
import {FinancialDataStore} from "../../../finance/project-financial-summary/state/financial-data.state";

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
         projectStore = inject(ProjectStore), installmentStore = inject(InstallmentStore),
         financialDataStore = inject(FinancialDataStore)) => ({
            setContractId(contractId: number) : void {
                patchState(store, {contractId: contractId});
            },
            // Signing sends the deposit with the contract; the backend adds it to the project in the same save
            changeStatus: rxMethod<{ contract: Contract }>(
                pipe(
                    mergeMap(({contract}) => {
                        return contractRestService.changeStatus(store.contractId()!, contract)
                            .pipe(
                                tap(savedContract => {
                                    projectStore.setProjectNeedsRefresh();
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Contract status changed.`,
                                        detail: `Status of contract with id: ${savedContract.id} was updated.`
                                    });
                                    if (contract.deposit) {
                                        installmentStore.setInstallmentsNeedRefresh();
                                        financialDataStore.setProjectFinancialDataNeedsUpdate();
                                    }
                                }),
                                // The REST service already shows the error toast; keep the stream alive for the next save
                                catchError(() => EMPTY)
                            )
                    })
                )
            ),

        }))
)
