import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {StageRestService} from "../rest/stage-rest.service";
import {MessageService} from "primeng/api";

import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";
import {
    loadStage,
    loadStageError,
    loadStagesForProject,
    loadStagesForProjectError,
    loadStagesForProjectSuccess,
    loadStageSuccess
} from "./stage.action";

@Injectable()
export class StageEffects {
    constructor(private actions$: Actions, protected stageRestService: StageRestService,
                private messageService: MessageService) {
    }

    loadStages$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadStagesForProject),
            mergeMap(action => this.stageRestService.getStagesForProject(action.projectId)
                .pipe(
                    map(stages => {
                        return loadStagesForProjectSuccess({stages: stages})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error loading stages.`,
                            detail: `There was a problem loading stages for project with id ${action.projectId}.`
                        });
                        return of(loadStagesForProjectError({error: error}))
                    })
                )
            )
        )
    });

    loadStage$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadStage),
            mergeMap(action => this.stageRestService.getStage(action.projectId, action.stageId)
                .pipe(
                    map(stage => {
                        return loadStageSuccess({stage: stage})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error loading stage.`,
                            detail: `There was a problem with id ${action.stageId} for project with id ${action.projectId}.`
                        });
                        return of(loadStageError({error: error}))
                    })
                )
            )
        )
    });
}
