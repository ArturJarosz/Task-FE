import {createReducer, on} from "@ngrx/store";
import {initialState, ProjectState} from "./project.state";
import {
    acceptOfferSuccess,
    completeContractSuccess,
    createProjectSuccess,
    loadProjectsSuccess,
    loadProjectSuccess,
    makeNewOfferSuccess,
    rejectOfferSuccess,
    resumeContractSuccess,
    signContractSuccess,
    terminateContractSuccess
} from "./project.action";

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
    }),

    on(loadProjectSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            project: action.project
        }
    }),

    on(acceptOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),

    on(completeContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),

    on(makeNewOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),

    on(rejectOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),

    on(resumeContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),

    on(signContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),

    on(terminateContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: ''
        }
    }),
)
