import {Actions, createEffect, ofType} from "@ngrx/effects";
import {ProjectRestService} from "../rest/project-rest.service";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {
    createProject,
    createProjectError,
    createProjectSuccess,
    loadProjects, loadProjectsError,
    loadProjectsSuccess
} from "./project.action";
import {catchError, map, mergeMap, of} from "rxjs";
import {MessageSeverity} from "../../shared";

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
                    return of(loadProjectsError({error: error}))
                })
            ))
        )
    });

    createProject$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(createProject),
            mergeMap(action => this.projectRestService.createProject(action.projectCreate)
                .pipe(
                    map(project => {
                        this.messageService.add({
                            severity: MessageSeverity.INFO,
                            summary: `Project created.`,
                            detail: `Project with id: ${project.id} was created.`
                        });
                        return createProjectSuccess({project: project})
                    }),
                    catchError(error => {
                        this.messageService.add({
                            severity: MessageSeverity.ERROR,
                            summary: `Error creating project`,
                            detail: `There was a problem with creating new project.`
                        });
                        return of(createProjectError({error: error}))
                    })
                ))
        )
    })
}
