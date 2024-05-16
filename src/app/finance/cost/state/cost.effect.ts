import {inject, Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {CostRestService} from "../rest/cost-rest.service";
import {MessageService} from "primeng/api";
import {createCost, createCostError, createCostSuccess, loadCost, loadCostError, loadCostSuccess} from "./cost.actions";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../../shared";
import {ProjectStore} from "../../../project/state";

@Injectable()
export class CostEffect {
    readonly projectStore = inject(ProjectStore);

    constructor(private actions$: Actions, private costRestService: CostRestService,
                private messageService: MessageService) {
    }

    loadCost$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadCost),
            mergeMap(action => this.costRestService.getCost(action.projectId, action.costId)
                .pipe(
                    map(cost => {
                        return loadCostSuccess({cost: cost})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error loading cost.`,
                            detail: `There was a problem with cost with id ${action.costId} for project with id ${action.projectId}.`
                        });
                        return of(loadCostError({error: error}))
                    })
                )
            )
        )
    })

    createCost$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(createCost),
            mergeMap(action => this.costRestService.createCost(action.projectId, action.cost)
                .pipe(
                    map(cost => {
                        this.projectStore.setProjectNeedsRefresh();
                        this.messageService.add({
                            severity: MessageSeverity.SUCCESS,
                            summary: `Cost created.`,
                            detail: `Cost with id: ${cost.id} was created.`
                        });
                        return createCostSuccess({cost: cost})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error creating cost.`,
                            detail: `There was a problem with creating new cost.`
                        });
                        return of(createCostError({error: error}))
                    })
                )
            )
        )
    })

}
