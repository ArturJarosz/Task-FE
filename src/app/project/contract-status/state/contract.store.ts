import {AppState} from "../../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, Observable, pipe} from "rxjs";
import {MessageSeverity} from "../../../shared/message";
import {runSave} from "../../../shared/utils/save-utils";
import {Contract} from "../../../generated/models/contract";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {ContractRestService} from "../../rest/contract-rest.service";
import {ProjectStore} from "../../state";
import {ProjectTimeSummaryStore} from "../../state/project-time-summary.state";
import {InstallmentStore} from "../../../finance/installment/state/installment.state";
import {FinancialDataStore} from "../../../finance/project-financial-summary/state/financial-data.state";

export interface ContractState extends AppState {
    contractId: number | undefined;
    saving: boolean;
}

export const initialState: ContractState = {
    contractId: undefined,
    saving: false
}

export const ContractStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, messageService = inject(MessageService), contractRestService = inject(ContractRestService),
         projectStore = inject(ProjectStore), installmentStore = inject(InstallmentStore),
         financialDataStore = inject(FinancialDataStore), timeSummaryStore = inject(ProjectTimeSummaryStore)) => {
        const save = (request: Observable<Contract>, onSaved: (saved: Contract) => void, afterSave?: () => void) =>
            runSave(request, saving => patchState(store, {saving}), saved => {
                projectStore.setProjectNeedsRefresh();
                // The list shows the contract's status and value too
                projectStore.setProjectsNeedRefresh();
                // The rates per hour divide the contract value and the net value
                timeSummaryStore.setTimeSummaryNeedsRefresh();
                onSaved(saved);
            }, afterSave);
        return {
            setContractId(contractId: number) : void {
                patchState(store, {contractId: contractId});
            },
            // Signing sends the deposit with the contract; the backend adds it to the project in the same save
            changeStatus: rxMethod<{ contract: Contract, afterSave?: () => void }>(
                pipe(
                    concatMap(({contract, afterSave}) => save(
                        contractRestService.changeStatus(store.contractId()!, contract), savedContract => {
                            messageService.add({
                                severity: MessageSeverity.INFO,
                                summary: `Contract status changed.`,
                                detail: `Status of contract with id: ${savedContract.id} was updated.`
                            });
                            if (contract.deposit) {
                                installmentStore.setInstallmentsNeedRefresh();
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                            }
                        }, afterSave))
                )
            ),
            // Dates and value without a status change: the status endpoint refuses a transition to the same status
            updateContract: rxMethod<{ contract: Contract, afterSave?: () => void }>(
                pipe(
                    concatMap(({contract, afterSave}) => save(
                        contractRestService.updateContract(store.contractId()!, contract), savedContract => {
                            messageService.add({
                                severity: MessageSeverity.SUCCESS,
                                summary: `Contract updated.`,
                                detail: `Contract with id: ${savedContract.id} was updated.`
                            });
                        }, afterSave))
                )
            ),
        };
    })
)
