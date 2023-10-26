import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ProjectRestService} from "../rest/project-rest.service";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {loadProjects, loadProjectsSuccess} from "./project.action";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";
import {loadClientsError} from "../../client/state";

@Injectable()
export class ProjectEffects {
    constructor(private actions$: Actions, private projectRestService: ProjectRestService, private messageService: MessageService) {
    }

    loadProjects$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadProjects),
            mergeMap(() => this.projectRestService.getProjects().pipe(
                map(projects => loadProjectsSuccess({projects: projects})),
                catchError(error => {
                    this.messageService.add({
                        severity: MessageSeverity.ERROR,
                        summary: "Error loading projects.",
                        detail: `There was a problem with loading projects.`
                    });
                    return of(loadClientsError({error: error}))
                })
            ))
        )
    })
}
