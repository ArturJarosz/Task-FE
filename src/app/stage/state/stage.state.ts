import {AppState} from "../../state/app.store";
import {Stage} from "../../generated/models/stage";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, pipe, switchMap, tap} from "rxjs";
import {inject} from "@angular/core";
import {StageRestService} from "../rest/stage-rest.service";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {ProjectStore} from "../../project/state";
import {FinancialDataStore} from "../../finance/project-financial-summary/state/financial-data.state";

export interface StageState extends AppState {
    projectId: number | undefined,
    stageId: number | undefined,
    error: string,
    stages: Stage[],
    stage: Stage | null,
    stageNeedsRefresh: boolean,
    stagesNeedRefresh: boolean,
    stageLoadFailed: boolean
}

export const initialState: StageState = {
    projectId: undefined,
    stageId: undefined,
    error: '',
    stages: [],
    stage: null,
    stageNeedsRefresh: true,
    stagesNeedRefresh: true,
    stageLoadFailed: false,
}

export const StageStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, stageRestService = inject(StageRestService), messageService = inject(MessageService),
                 projectStore = inject(ProjectStore), financialDataStore = inject(FinancialDataStore)) => ({
        setProjectId(projectId: number) {
            patchState(store, {projectId: projectId});
        },
        setStageId(stageId: number) {
            patchState(store, {stageId: stageId});
        },
        refreshStage(): void {
            patchState(store, {stageNeedsRefresh: true})
        },
        refreshStages(): void {
            patchState(store, {stagesNeedRefresh: true})
        },
        loadStage: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {stageLoadFailed: false})),
                switchMap(() => {
                    return stageRestService.getStage(store.projectId()!, store.stageId()!)
                        .pipe(
                            tap(stage => patchState(store, {stage: stage, stageNeedsRefresh: false})),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {stageNeedsRefresh: false, stageLoadFailed: true});
                                return EMPTY;
                            })
                        )
                })
            )
        ),
        loadStages: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return stageRestService.getStagesForProject(store.projectId()!)
                        .pipe(
                            tap(stages => patchState(store, {stages: stages, stagesNeedRefresh: false})),
                            catchError(() => {
                                patchState(store, {stagesNeedRefresh: false});
                                return EMPTY;
                            })
                        )
                })
            )
        ),
        createStage: rxMethod<{ projectId: number, stage: Stage }>(
            pipe(
                switchMap(({stage}) => {
                    return stageRestService.createStage(store.projectId()!, stage)
                        .pipe(
                            tap(stage => {
                                    projectStore.setProjectNeedsRefresh();
                                projectStore.setProjectsNeedRefresh();
                                    financialDataStore.setProjectFinancialDataNeedsUpdate();
                                    messageService.add({
                                        severity: MessageSeverity.SUCCESS,
                                        summary: `Stage created`,
                                        detail: `${stage.name} was added to the project.`,
                                    });
                                }
                            ),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        deleteStage: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return stageRestService.removeStage(store.projectId()!, store.stageId()!)
                        .pipe(
                            tap(() => {
                                projectStore.setProjectNeedsRefresh();
                                projectStore.setProjectsNeedRefresh();
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Stage deleted`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        rejectStage: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return stageRestService.rejectStage(store.projectId()!, store.stageId()!)
                        .pipe(
                            tap(updatedStage => {
                                projectStore.setProjectNeedsRefresh();
                                projectStore.setProjectsNeedRefresh();
                                patchState(store, {stage: updatedStage, stageNeedsRefresh: false});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Stage rejected`,
                                    detail: `${updatedStage.name} was rejected.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        reopenStage: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return stageRestService.reopenStage(store.projectId()!, store.stageId()!)
                        .pipe(
                            tap(updatedStage => {
                                projectStore.setProjectNeedsRefresh();
                                projectStore.setProjectsNeedRefresh();
                                patchState(store, {stage: updatedStage, stageNeedsRefresh: false});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Stage reopened`,
                                    detail: `${updatedStage.name} was reopened.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        updateStage: rxMethod<{ stage: Stage }>(
            pipe(
                switchMap(({stage}) => {
                    return stageRestService.updateStage(store.projectId()!, store.stageId()!, stage)
                        .pipe(
                            tap(updatedStage => {
                                projectStore.setProjectNeedsRefresh();
                                projectStore.setProjectsNeedRefresh();
                                patchState(store, {stage: updatedStage, stageNeedsRefresh: false});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Stage saved`,
                                    detail: `${updatedStage.name} was updated.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        )
    }))
)
