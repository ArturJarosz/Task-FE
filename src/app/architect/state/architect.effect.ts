import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ArchitectRestService} from "../rest/architect-rest.service";
import {MessageService} from "primeng/api";
import {
    loadArchitect,
    loadArchitectError,
    loadArchitects,
    loadArchitectsError,
    loadArchitectsSuccess,
    loadArchitectSuccess
} from "./architect.action";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";

@Injectable()
export class ArchitectEffect {
    constructor(private actions$: Actions, private architectRestService: ArchitectRestService, private messageService: MessageService) {
    }

    loadArchitects$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadArchitects),
            mergeMap(() => this.architectRestService.getArchitects()
                .pipe(
                    map(architects => loadArchitectsSuccess({architects: architects})),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: "Error loading architects.",
                            detail: `There was a problem with loading architects.`
                        });
                        return of(loadArchitectsError({error: error}))
                    })
                ))
        )
    });

    loadArchitect$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadArchitect),
            mergeMap(action => this.architectRestService.getArchitect(action.architectId)
                .pipe(
                    map(architect => loadArchitectSuccess({architect: architect})),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: "Error loading architect.",
                            detail: `There was a problem with loading architect with id ${action.architectId}.`
                        });
                        return of(loadArchitectError({error: error}))
                    })
                ))
        )
    });
}
