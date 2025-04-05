import {Installment} from "../../../generated/models/installment";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {inject} from "@angular/core";
import {InstallmentRestService} from "../rest/installment-rest.service";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {FinancialDataStore} from "../../project-financial-summary/state/financial-data.state";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../../shared";

export interface InstallmentState {
    installment: Installment;
    installments: Installment[];
    installmentProjectData: InstallmentProjectData,
    installmentsNeedRefresh: boolean;
    installmentNeedsRefresh: boolean;
    installmentId: number | undefined;
    projectId: number | undefined;
}

export const initialState: InstallmentState = {
    installment: {},
    installments: [],
    installmentProjectData: {},
    installmentsNeedRefresh: true,
    installmentNeedsRefresh: true,
    installmentId: undefined,
    projectId: undefined
}

export const InstallmentStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, installmentRestService = inject(InstallmentRestService),
                 financialDataStore = inject(FinancialDataStore), messageService = inject(MessageService)) => ({
        setInstallmentId(installmentId: number) {
            if (store.installmentId() !== installmentId) {
                this.setInstallmentNeedsRefresh();
            }
            patchState(store, {installmentId: installmentId});
        },
        setProjectId(projectId: number) {
            if (store.projectId() !== projectId) {
                this.setInstallmentsNeedRefresh();
            }
            patchState(store, {projectId: projectId});
        },
        setInstallmentsNeedRefresh() {
            patchState(store, {installmentsNeedRefresh: true});
        },
        setInstallmentNeedsRefresh() {
            patchState(store, {installmentNeedsRefresh: true})
        },
        loadProjectInstallments: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.installmentsNeedRefresh()) {
                        return installmentRestService.getProjectInstallmentData(store.projectId()!)
                            .pipe(
                                tap(installmentsData => patchState(store, {
                                    installments: installmentsData.installments,
                                    installmentProjectData: installmentsData,
                                    installmentsNeedRefresh: false
                                }))
                            )
                    }
                    return of({})
                })
            )
        ),
        createInstallment: rxMethod<{ installment: Installment }>(
            pipe(
                switchMap(({installment}) => {
                    return installmentRestService.createInstallment(store.projectId()!, installment)
                        .pipe(
                            tap(installment => {
                                patchState(store, {
                                    installment: installment,
                                    installmentsNeedRefresh: true
                                });
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `New installment created`,
                                    detail: `New installment was successfully created.`,
                                })
                            })
                        )
                })
            )
        ),
        loadInstallment: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.installmentNeedsRefresh()) {
                        return installmentRestService.getInstallment(store.projectId()!, store.installmentId()!)
                            .pipe(
                                tap(installment => {
                                    patchState(store, {
                                        installment: installment,
                                        installmentNeedsRefresh: false
                                    });
                                }))
                    }
                    return of({})
                })
            )
        ),
        updateInstallment: rxMethod<{ installment: Installment }>(
            pipe(
                switchMap(({installment}) => {
                    return installmentRestService.updateInstallment(store.projectId()!, store.installmentId()!,
                        installment)
                        .pipe(
                            tap(installment => {
                                    patchState(store, {
                                        installment: installment,
                                        installmentsNeedRefresh: true,
                                        installmentNeedsRefresh: false
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.SUCCESS,
                                        summary: `Installment updated`,
                                        detail: `Installment for stage ${installment.stageName} was successfully updated.`,
                                    });
                                    financialDataStore.setProjectFinancialDataNeedsUpdate();
                                }
                            )
                        )
                })
            )
        )

    }))
)
