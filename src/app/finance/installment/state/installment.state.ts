import {Installment} from "../../../generated/models/installment";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {inject} from "@angular/core";
import {InstallmentRestService} from "../rest/installment-rest.service";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";

export interface InstallmentState {
    installments: Installment[];
    installmentProjectData: InstallmentProjectData,
    installmentsNeedRefresh: boolean;
    installmentNeedsRefresh: boolean;
    installmentId: number | undefined;
    projectId: number | undefined;
}

export const initialState: InstallmentState = {
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
    withMethods((store, installmentRestService = inject(InstallmentRestService)) => ({
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
    }))
)
