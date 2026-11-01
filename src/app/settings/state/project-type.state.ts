import {AppState} from "../../state/app.store";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {inject} from "@angular/core";
import {MessageService} from "primeng/api";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, concatMap, EMPTY, finalize, pipe, switchMap, tap} from "rxjs";
import {MessageSeverity} from "../../shared";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ProjectType} from "../../generated/models/project-type";
import {ProjectTypeRestService} from "../rest/project-type-rest.service";

export interface ProjectTypeState extends AppState {
    projectTypes: ProjectType[];
    // True once the list was loaded; later loads refresh it in place
    projectTypesLoaded: boolean;
    projectTypesLoadFailed: boolean;
    // A create or rename is being saved
    projectTypeSaving: boolean;
    // Id of the project type being deleted
    projectTypeDeleting: number | null;
}

const initialState: ProjectTypeState = {
    projectTypes: [],
    projectTypesLoaded: false,
    projectTypesLoadFailed: false,
    projectTypeSaving: false,
    projectTypeDeleting: null,
}

export const ProjectTypeStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, projectTypeRestService = inject(ProjectTypeRestService),
                 configurationStore = inject(ConfigurationStore), messageService = inject(MessageService)) => {
        const loadProjectTypes = rxMethod<void>(
            pipe(
                tap(() => patchState(store, {projectTypesLoadFailed: false})),
                switchMap(() => projectTypeRestService.getProjectTypes()
                    .pipe(
                        tap(projectTypes => patchState(store, {projectTypes: projectTypes, projectTypesLoaded: true})),
                        // The REST service already shows the error toast; keep the stream alive for the next load
                        catchError(() => {
                            patchState(store, {projectTypesLoadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        );
        // Project types are listed in the application configuration too (project forms, filters and labels), which
        // every page using them loads when it opens
        const afterChange = (summary: string) => {
            messageService.add({severity: MessageSeverity.INFO, summary: summary});
            loadProjectTypes();
            configurationStore.markConfigurationStale();
        };
        return {
            loadProjectTypes: loadProjectTypes,
            // afterSave runs only when the save worked, so a dialog stays open with what was typed after an error
            saveProjectType: rxMethod<{ projectType: ProjectType, afterSave?: () => void }>(
                pipe(
                    concatMap(({projectType, afterSave}) => {
                        patchState(store, {projectTypeSaving: true});
                        let request = projectType.id != null
                            ? projectTypeRestService.updateProjectType(projectType.id, projectType)
                            : projectTypeRestService.createProjectType(projectType);
                        return request.pipe(
                            tap(saved => {
                                afterChange(`${saved.name} saved`);
                                afterSave?.();
                            }),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {projectTypeSaving: false}))
                        );
                    })
                )
            ),
            deleteProjectType: rxMethod<ProjectType>(
                pipe(
                    concatMap(projectType => {
                        patchState(store, {projectTypeDeleting: projectType.id!});
                        return projectTypeRestService.deleteProjectType(projectType.id!).pipe(
                            tap(() => afterChange(`${projectType.name} deleted`)),
                            catchError(() => EMPTY),
                            finalize(() => patchState(store, {projectTypeDeleting: null}))
                        );
                    })
                )
            ),
        };
    })
)
