import {AppState} from "../../state/app.store";
import {Project} from "../../generated/models/project";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, of, pipe, switchMap, tap} from "rxjs";
import {ProjectRestService} from "../rest/project-rest.service";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {ProjectCreate} from "../../generated/models/project-create";

export interface ProjectState extends AppState {
    error: string,
    projects: Project[],
    project: Project | null,
    projectId: number | undefined,
    projectsNeedRefresh: boolean,
    projectNeedsRefresh: boolean
}

export const initialState: ProjectState = {
    error: '',
    projects: [],
    project: null,
    projectId: undefined,
    projectsNeedRefresh: true,
    projectNeedsRefresh: true
}

export const ProjectStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, projectRestService = inject(ProjectRestService), messageService = inject(MessageService)) => ({
        setProjectId(projectId: number) {
            patchState(store, {projectId: projectId});
        },
        setProjectNeedsRefresh(): void {
            patchState(store, {projectNeedsRefresh: true})
        },
        setProjectsNeedRefresh(): void {
            patchState(store, {projectsNeedRefresh: true})
        },
        loadProject: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return projectRestService.getProject(store.projectId()!)
                        .pipe(
                            tap(project => patchState(store, {project: project, projectNeedsRefresh: false})),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading project.`,
                                    detail: `There was a problem with loading project with id ${store.projectId()!}.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        ),
        loadProjects: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return projectRestService.getProjects()
                        .pipe(
                            tap(projects => patchState(store, {projects: projects, projectsNeedRefresh: false})),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error loading projects.`,
                                    detail: `There was a problem with loading projects.`,
                                });
                                return of(error);
                            })
                        )
                })
            )
        ),
        createProject: rxMethod<{ projectCreate: ProjectCreate }>(
            pipe(
                switchMap(({projectCreate}) => {
                    return projectRestService.createProject(projectCreate)
                        .pipe(
                            tap(project => {
                                patchState(store, {projectsNeedRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Project created.`,
                                    detail: `New project with id: ${project.id} was created.`
                                });
                            }),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error creating project.`,
                                    detail: `There was a problem with creating a new project.`
                                });
                                return of(error)
                            })
                        )
                })
            )
        ),
        updateProject: rxMethod<{ project: Project }>(
            pipe(
                switchMap(({project}) => {
                    console.log(`Updating project with id: ${store.projectId()}`)
                    return projectRestService.updateProject(store.projectId()!, project)
                        .pipe(
                            tap(project => {
                                patchState(store, {projectsNeedRefresh: true, projectNeedsRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Project updated.`,
                                    detail: `Project with id: ${project.id} was updated.`
                                });
                            }),
                            catchError(error => {
                                messageService.add({
                                    severity: MessageSeverity.ERROR,
                                    summary: `Error updating project.`,
                                    detail: `There was a problem with updating a project with id ${project.id}.`
                                });
                                return of(error)
                            })
                        )
                })
            )
        )
    }))
)
