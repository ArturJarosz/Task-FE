import {AppState} from "../../../state/app.store";
import {Supervision} from "../../../generated/models/supervision";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {FinancialDataStore} from "../../project-financial-summary/state/financial-data.state";
import {MessageService} from "primeng/api";
import {SupervisionRestService} from "../rest/supervision-rest.service";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import { MessageSeverity } from "src/app/shared/message";
import {ProjectStore} from "../../../project/state";

export interface SupervisionState extends AppState {
    supervision: Supervision | null;
    supervisionVisits: SupervisionVisit[];
    supervisionVisit: SupervisionVisit | null;
    supervisionNeedsRefresh: boolean;
    supervisionVisitsNeedRefresh: boolean;
    supervisionVisitNeedsRefresh: boolean;
    supervisionId: number | undefined;
    visitId: number | undefined;
    projectId: number | undefined;
}

export const initialState: SupervisionState = {
    supervision: null,
    supervisionVisits: [],
    supervisionVisit: null,
    supervisionNeedsRefresh: true,
    supervisionVisitsNeedRefresh: true,
    supervisionVisitNeedsRefresh: true,
    supervisionId: undefined,
    visitId: undefined,
    projectId: undefined
}

export const SupervisionStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, supervisionRestService = inject(SupervisionRestService),
                 financialDataStore = inject(FinancialDataStore),
                 projectStore = inject(ProjectStore),
                 messageService = inject(MessageService)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() !== projectId) {
                this.setSupervisionNeedsRefresh();
            }
            patchState(store, {projectId: projectId});
        },
        setSupervisionNeedsRefresh() {
            patchState(store, {supervisionNeedsRefresh: true})
        },
        setSupervisionVisitsNeedRefresh() {
            patchState(store, {supervisionVisitsNeedRefresh: true})
        },
        setSupervisionVisitNeedsRefresh() {
            patchState(store, {supervisionVisitNeedsRefresh: true})
        },
        setVisitId(visitId: number) {
            if (store.visitId() !== visitId) {
                this.setSupervisionVisitNeedsRefresh();
            }
            patchState(store, {visitId: visitId});
        },
        setSupervisionId(supervisionId: number) {
            if (store.supervisionId() !== supervisionId) {
                this.setSupervisionVisitsNeedRefresh();
            }
            patchState(store, {supervisionId: supervisionId});
        },
        loadSupervision: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.supervisionNeedsRefresh()) {
                        return supervisionRestService.getSupervision(store.projectId()!)
                            .pipe(tap(supervision => {
                                if (!supervision) {
                                    return;
                                }
                                patchState(store, {
                                supervisionId: supervision.id,
                                supervision: supervision,
                                supervisionNeedsRefresh: false
                            })}))
                    }
                    return of({});
                })
            )
        ),
        createSupervision: rxMethod<{ supervision: Supervision }>(
            pipe(
                switchMap(({supervision}) => {
                    supervision.projectId = store.projectId();
                    return supervisionRestService.createSupervision(supervision)
                        .pipe(
                            tap(supervision => {
                                patchState(store, {supervision: supervision, supervisionNeedsRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: `New supervision created`,
                                    detail: `New supervision for project ${supervision.projectId} was created successfully.`
                                });
                                projectStore.refreshProjectById(supervision.projectId!);
                            })
                        )
                })
            )
        ),
        loadSupervisionVisits: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.supervisionVisitsNeedRefresh() && store.supervisionId()) {
                        return supervisionRestService.getSupervisionVisits(store.supervisionId()!)
                            .pipe(tap(visits => patchState(store, {
                                supervisionVisits: visits,
                                supervisionVisitsNeedRefresh: false
                            })));
                    }
                    return of([]);
                })
            )
        ),
        createSupervisionVisit: rxMethod<{ supervisionVisit: SupervisionVisit }>(
            pipe(
                switchMap(({supervisionVisit}) => {
                    supervisionVisit.supervisionId = store.supervisionId();
                    return supervisionRestService.createSupervisionVisit(store.supervisionId()!, supervisionVisit)
                        .pipe(
                            tap(createdVisit => {
                                patchState(store, {supervisionVisitsNeedRefresh: true, supervisionNeedsRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: 'Supervision visit created',
                                    detail: `New supervision visit created successfully.`
                                });
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                            })
                        );
                })
            )
        ),
        loadSupervisionVisit: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    if (store.supervisionVisitNeedsRefresh() && store.supervisionId() && store.visitId()) {
                        return supervisionRestService.getSupervisionVisit(store.supervisionId()!, store.visitId()!)
                            .pipe(tap(visit => patchState(store, {
                                supervisionVisit: visit,
                                supervisionVisitNeedsRefresh: false
                            })));
                    }
                    return of(null);
                })
            )
        ),
        updateSupervisionVisit: rxMethod<{ supervisionVisit: SupervisionVisit }>(
            pipe(
                switchMap(({supervisionVisit}) => {
                    return supervisionRestService.updateSupervisionVisit(store.supervisionId()!, store.visitId()!, supervisionVisit)
                        .pipe(
                            tap(updatedVisit => {
                                patchState(store, {
                                    supervisionVisit: updatedVisit,
                                    supervisionVisitsNeedRefresh: true,
                                    supervisionNeedsRefresh: true
                                });
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: 'Supervision visit updated',
                                    detail: `Supervision visit updated successfully.`
                                });
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                            })
                        );
                })
            )
        ),
        deleteSupervisionVisit: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return supervisionRestService.deleteSupervisionVisit(store.supervisionId()!, store.visitId()!)
                        .pipe(
                            tap(() => {
                                patchState(store, {
                                    supervisionVisit: null,
                                    supervisionVisitsNeedRefresh: true,
                                    supervisionNeedsRefresh: true
                                });
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: 'Supervision visit deleted',
                                    detail: `Supervision visit deleted successfully.`
                                });
                                financialDataStore.setProjectFinancialDataNeedsUpdate();
                            })
                        );
                })
            )
        ),
    }))
)
