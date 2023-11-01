import {createReducer, on} from "@ngrx/store";
import {initialState, ProjectState} from "./project.state";
import {createProjectSuccess, loadProjectsSuccess} from "./project.action";

export const projectReducer = createReducer<ProjectState>(
    initialState,
    on(loadProjectsSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projects: action.projects
        }
    }),

    on(createProjectSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    })
)
