import {AppState} from "../../state/app.store";
import {Project} from "../project";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

export interface ProjectState extends AppState {
    error: string,
    projects: Project[],
    project: Project | null,
    projectsNeedRefresh: boolean
}

export const initialState: ProjectState = {
    error: '',
    projects: [],
    project: null,
    projectsNeedRefresh: false
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
