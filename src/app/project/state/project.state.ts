import {AppState} from "../../state/app.store";
import {Project} from "../project";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

export interface ProjectState extends AppState {
    error: string;
    projects: Project[]
}

export const initialState: ProjectState = {
    error: '',
    projects: []
}

const getProjectFeatureState = createFeatureSelector<ProjectState>(Features.PROJECT);

export const getProjects = createSelector(
    getProjectFeatureState,
    state => state.projects
)
