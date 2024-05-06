import {AppState} from "../../state/app.store";
import {Store} from "@ngrx/store";
import {Stage} from "../../generated/models/stage";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {inject} from "@angular/core";
import {StageRestService} from "../rest/stage-rest.service";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {ProjectState, ProjectStore} from "../../project/state";

export interface StageState extends AppState {
    projectId: number | undefined,
    stageId: number | undefined,
    error: string,
    stages: Stage[],
    stage: Stage | null,
    stageNeedsRefresh: boolean,
    stagesNeedRefresh: boolean
}

export const initialState: StageState = {
    projectId: undefined,
    stageId: undefined,
    error: '',
    stages: [],
    stage: null,
    stageNeedsRefresh: true,
    stagesNeedRefresh: true,
}

export const StageStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, stageRestService = inject(StageRestService), messageService = inject(MessageService),
                 projectStore = inject(ProjectStore)) => ({
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
                switchMap(() => {
                    return stageRestService.getStage(store.projectId()!, store.stageId()!)
                        .pipe(
                            tap(stage => patchState(store, {stage: stage, stageNeedsRefresh: false})),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading stage`,
                                    detail: `There was a problem with loading stage with id: ${store.stageId()!}.`,
                                });
                                return of(error);
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
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading stages`,
                                    detail: `There was a problem with loading stages for project with id: ${store.projectId()!}.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        ),
        createStage: rxMethod<{ projectId: number,stage: Stage }>(
            pipe(
                switchMap(({stage}) => {
                    projectStore.setProjectNeedsRefresh();
                    return stageRestService.createStage(store.projectId()!, stage)
                        .pipe(
                            tap(stage => {
                                messageService.add({
                                    severity: MessageSeverity.INFO,
                                    summary: `New stage created`,
                                    detail: `New stage for project with id ${store.projectId()} was created.`,
                                });
                                }
                            ),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error creating stage`,
                                    detail: `There was a problem with creating new stage for project with id: ${store.projectId()!}.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        ),
    }))
)
