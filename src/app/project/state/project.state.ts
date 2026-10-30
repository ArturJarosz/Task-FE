import {AppState} from "../../state/app.store";
import {Project} from "../../generated/models/project";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {ProjectRestService} from "../rest/project-rest.service";
import {computed, inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";
import {ProjectCreate} from "../../generated/models/project-create";
import {FinancialDataStore} from "../../finance/project-financial-summary/state/financial-data.state";

export interface ProjectState extends AppState {
    error: string,
    projects: Project[],
    project: Project | null,
    projectId: number | undefined,
    projectsNeedRefresh: boolean,
    projectNeedsRefresh: boolean,
    projectLoadFailed: boolean,
    projectsLoadFailed: boolean,
}

export const initialState: ProjectState = {
    error: '',
    projects: [],
    project: null,
    projectId: undefined,
    projectsNeedRefresh: true,
    projectNeedsRefresh: true,
    projectLoadFailed: false,
    projectsLoadFailed: false,
}

export const ProjectStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({project}) => ({
        projectName: computed(() => {
            if (project()) {
                return project()!.name!;
            }
            return '';
        })
    })),
    withComputed(({project}) => ({
        projectHasSupervision: computed(() => project()?.supervision != null)
    })),
    withMethods((store, projectRestService = inject(ProjectRestService), messageService = inject(MessageService),
                 financialDataStore = inject(FinancialDataStore)) => ({
        setProjectId(projectId: number) {
            if (store.projectId() != projectId) {
                financialDataStore.setProjectFinancialDataNeedsUpdate();
                this.setProjectNeedsRefresh();
            }
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
                tap(() => patchState(store, {projectLoadFailed: false})),
                switchMap(() => {
                    if (store.projectNeedsRefresh()) {
                        return projectRestService.getProject(store.projectId()!)
                            .pipe(
                                tap(project => patchState(store, {project: project, projectNeedsRefresh: false})),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {projectLoadFailed: true});
                                    return EMPTY;
                                })
                            )
                    }
                    return of({});
                })
            )
        ),
        loadProjects: rxMethod<{}>(
            pipe(
                tap(() => patchState(store, {projectsLoadFailed: false})),
                switchMap(() => {
                    if (store.projectsNeedRefresh()) {
                        return projectRestService.getProjects()
                            .pipe(
                                tap(projects => patchState(store, {projects: projects, projectsNeedRefresh: false})),
                                // The REST service already shows the error toast; keep the stream alive for the next load
                                catchError(() => {
                                    patchState(store, {projectsLoadFailed: true});
                                    return EMPTY;
                                })
                            )
                    }
                    return of({});
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
                                    detail: `New project: '${project.name}' of type: ${project.type} was created.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        updateProject: rxMethod<{ project: Project }>(
            pipe(
                switchMap(({project}) => {
                    return projectRestService.updateProject(store.projectId()!, project)
                        .pipe(
                            tap(project => {
                                patchState(store,
                                    {projectsNeedRefresh: true, projectNeedsRefresh: true, project: project});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Project updated.`,
                                    detail: `Project ${project.name} was updated.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        removeProject: rxMethod<{}>(
            pipe(
                switchMap(() => {
                    return projectRestService.removeProject(store.projectId()!)
                        .pipe(
                            tap(() => {
                                patchState(store, {projectsNeedRefresh: true});
                                messageService.add({
                                    severity: MessageSeverity.SUCCESS,
                                    summary: `Project removed.`,
                                    detail: `A project with id: ${store.projectId()} was removed.`
                                });
                            }),
                            catchError(() => EMPTY)
                        )
                })
            )
        ),
        refreshProjectById(projectId: number): void {
            patchState(store, {projectId: projectId, projectNeedsRefresh: true});
            this.loadProject({});
        },
    }))
)
