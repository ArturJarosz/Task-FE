import {Installment} from "../../../generated/models/installment";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, Observable, of, pipe, switchMap, tap} from "rxjs";
import {inject} from "@angular/core";
import {InstallmentRestService} from "../rest/installment-rest.service";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {FinancialDataStore} from "../../project-financial-summary/state/financial-data.state";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../../shared";

// One save from the installment page: the changed data, the payment date of an installment just marked paid, or both
export interface InstallmentSave {
    installment?: Installment;
    paymentDate?: string;
}

export interface InstallmentState {
    installment: Installment;
    installments: Installment[];
    installmentProjectData: InstallmentProjectData,
    installmentsNeedRefresh: boolean;
    installmentsLoadFailed: boolean;
    installmentNeedsRefresh: boolean;
    installmentLoadFailed: boolean;
    installmentId: number | undefined;
    projectId: number | undefined;
}

export const initialState: InstallmentState = {
    installment: {},
    installments: [],
    installmentProjectData: {},
    installmentsNeedRefresh: true,
    installmentsLoadFailed: false,
    installmentNeedsRefresh: true,
    installmentLoadFailed: false,
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
                // Drop the previous project's installments, so they are never shown on this one while it loads
                patchState(store, {installments: [], installmentProjectData: {}, installmentsLoadFailed: false});
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
                        patchState(store, {installmentsLoadFailed: false});
                        return installmentRestService.getProjectInstallmentData(store.projectId()!)
                            .pipe(
                                tap(installmentsData => patchState(store, {
                                    installments: installmentsData.installments,
                                    installmentProjectData: installmentsData,
                                    installmentsNeedRefresh: false
                                })),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {installmentsLoadFailed: true});
                                    return EMPTY;
                                })
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
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        loadInstallment: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {installmentLoadFailed: false})),
                switchMap(() => {
                    if (store.installmentNeedsRefresh()) {
                        return installmentRestService.getInstallment(store.projectId()!, store.installmentId()!)
                            .pipe(
                                tap(installment => {
                                    patchState(store, {
                                        installment: installment,
                                        installmentNeedsRefresh: false
                                    });
                                }),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {installmentLoadFailed: true});
                                    return EMPTY;
                                }))
                    }
                    return of({})
                })
            )
        ),
        // The data update and the payment are separate endpoints. Each runs only when the save needs it, the update
        // first and the payment after it, so neither overwrites the other. Their responses have no stage name, so the
        // installment is read again at the end.
        saveInstallment: rxMethod<InstallmentSave>(
            pipe(
                switchMap(({installment, paymentDate}) => {
                    const projectId = store.projectId()!;
                    const installmentId = store.installmentId()!;
                    const reload = () => installmentRestService.getInstallment(projectId, installmentId);
                    // Cold requests: the payment is only sent once the update has answered
                    const update$: Observable<unknown> = installment
                        ? installmentRestService.updateInstallment(projectId, installmentId, installment)
                        : of(null);
                    const pay$: Observable<unknown> = paymentDate
                        ? installmentRestService.payInstallment(projectId, installmentId, paymentDate)
                        : of(null);
                    return update$.pipe(
                        switchMap(() => pay$),
                        switchMap(() => reload()),
                        tap(saved => {
                            patchState(store, {installment: saved, installmentsNeedRefresh: true, installmentNeedsRefresh: false});
                            financialDataStore.setProjectFinancialDataNeedsUpdate();
                            messageService.add({
                                severity: MessageSeverity.SUCCESS,
                                summary: paymentDate ? 'Installment paid' : 'Installment updated',
                                detail: paymentDate
                                    ? `Installment for stage ${saved.stageName} is marked as paid.`
                                    : `Installment for stage ${saved.stageName} was successfully updated.`,
                            });
                        }),
                        // The REST service already shows the error toast. The update may have gone through before
                        // the payment failed, so show what the backend has now
                        catchError(() => reload().pipe(
                            tap(current => patchState(store, {installment: current, installmentsNeedRefresh: true})),
                            catchError(() => EMPTY)
                        ))
                    );
                })
            )
        )
    }))
)
