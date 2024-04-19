import {createReducer, on} from "@ngrx/store";
import {initialState, ProjectState} from "./project.state";
import {
    acceptOfferSuccess,
    completeContractSuccess,
    createProjectSuccess,
    loadProjectsSuccess,
    loadProjectSuccess,
    makeNewOfferSuccess, projectNeedsRefresh,
    rejectOfferSuccess,
    resumeContractSuccess,
    signContractSuccess,
    terminateContractSuccess
} from "./project.action";
import {ProjectStatus} from "../model/project";

export const projectReducer = createReducer<ProjectState>(
    initialState,
    on(loadProjectsSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projects: action.projects,
            projectsNeedRefresh: false,
            projectNeedsRefresh: false
        }
    }),

    on(createProjectSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(loadProjectSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            project: action.project,
            projectNeedsRefresh: false
        }
    }),

    on(acceptOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(completeContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(makeNewOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(rejectOfferSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(resumeContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(signContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(terminateContractSuccess, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectsNeedRefresh: true
        }
    }),

    on(projectNeedsRefresh, (state, action): ProjectState => {
        return {
            ...state,
            error: '',
            projectNeedsRefresh: true
        }
    }),
)
