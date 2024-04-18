import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {CostRestService} from "../rest/cost-rest.service";
import {MessageService} from "primeng/api";
import {loadCost, loadCostError, loadCostSuccess} from "./cost.actions";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../../shared";

@Injectable()
export class CostEffect {
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

}
