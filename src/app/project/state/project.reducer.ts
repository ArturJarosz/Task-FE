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
            projects: action.projects,
            projectNeedRefresh: false
        }
    }),

    on(createProjectSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
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
            error: '',
            projectNeedRefresh: true
        }
    }),

    on(completeContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
        }
    }),

    on(makeNewOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
        }
    }),

    on(rejectOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
        }
    }),

    on(resumeContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
        }
    }),

    on(signContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
        }
    }),

    on(terminateContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedRefresh: true
        }
    }),
)
