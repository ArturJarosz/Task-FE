import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Project} from "../../generated/models/project";

export interface ProjectState extends AppState {
    error: string,
    projects: Project[],
    project: Project | null,
    projectsNeedRefresh: boolean,
    projectNeedsRefresh: boolean
}

export const initialState: ProjectState = {
    error: '',
    projects: [],
    project: null,
    projectsNeedRefresh: true,
    projectNeedsRefresh: true
}

// selectors

const getProjectFeatureState = createFeatureSelector<ProjectState>(Features.PROJECT);

export const getProjects = createSelector(
    getProjectFeatureState,
    state => state.projects
)

export const getProject = createSelector(
    getProjectFeatureState,
    state => state.project
)

export const getProjectsNeedRefresh = createSelector(
    getProjectFeatureState,
    state => state.projectsNeedRefresh
)

export const getProjectNeedsRefresh = createSelector(
    getProjectFeatureState,
    state => state.projectNeedsRefresh
)
