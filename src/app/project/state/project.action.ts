import {createAction, props} from "@ngrx/store";
import {Project, ProjectContract, ProjectCreate} from "../model/project";

const PROJECTS = "[PROJECTS]";
const PROJECT_CONTRACT = "[PROJECT CONTRACT]";

// PROJECT
const LOAD_PROJECTS = `${PROJECTS} Load projects`;
const LOAD_PROJECTS_SUCCESS = `${PROJECTS} Load projects success`;
const LOAD_PROJECTS_ERROR = `${PROJECTS} Load projects error`;

const LOAD_PROJECT = `${PROJECTS} Load project`;
const LOAD_PROJECT_SUCCESS = `${PROJECTS} Load project success`;
const LOAD_PROJECT_ERROR = `${PROJECTS} Load projects error`;

const CREATE_PROJECT = `${PROJECTS} Create project`;
const CREATE_PROJECT_SUCCESS = `${PROJECTS} Create project success`;
const CREATE_PROJECT_ERROR = `${PROJECTS} Create project error`;

// CONTRACT
const ACCEPT_OFFER = `${PROJECT_CONTRACT} Accept offer`;
const ACCEPT_OFFER_SUCCESS = `${PROJECT_CONTRACT} Accept offer success`;
const ACCEPT_OFFER_ERROR = `${PROJECT_CONTRACT} Accept offer error`;

const COMPLETE_CONTRACT = `${PROJECT_CONTRACT} Complete contract`;
const COMPLETE_CONTRACT_SUCCESS = `${PROJECT_CONTRACT} Complete contract success`;
const COMPLETE_CONTRACT_ERROR = `${PROJECT_CONTRACT} Complete contract error`;

const MAKE_NEW_OFFER = `${PROJECT_CONTRACT} Make new offer`;
const MAKE_NEW_OFFER_SUCCESS = `${PROJECT_CONTRACT} Make new offer success`;
const MAKE_NEW_OFFER_ERROR = `${PROJECT_CONTRACT} Make new offer error`;

const REJECT_OFFER = `${PROJECT_CONTRACT} Reject offer`;
const REJECT_OFFER_SUCCESS = `${PROJECT_CONTRACT} Reject offer success`;
const REJECT_OFFER_ERROR = `${PROJECT_CONTRACT} Reject offer error`;

const RESUME_CONTRACT = `${PROJECT_CONTRACT} Resume contract`;
const RESUME_CONTRACT_SUCCESS = `${PROJECT_CONTRACT} Resume contract success`;
const RESUME_CONTRACT_ERROR = `${PROJECT_CONTRACT} Resume contract error`;

const SING_CONTRACT = `${PROJECT_CONTRACT} Sign contract`;
const SING_CONTRACT_SUCCESS = `${PROJECT_CONTRACT} Sign contract success`;
const SING_CONTRACT_ERROR = `${PROJECT_CONTRACT} Sign contract error`;

const TERMINATE_CONTRACT = `${PROJECT_CONTRACT} Terminate contract`;
const TERMINATE_CONTRACT_SUCCESS = `${PROJECT_CONTRACT} Terminate contract success`;
const TERMINATE_CONTRACT_ERROR = `${PROJECT_CONTRACT} Terminate contract error`;

const PROJECT_NEEDS_REFRESH = `${PROJECTS} Project needs refresh`;


export const loadProjects = createAction(LOAD_PROJECTS);
export const loadProjectsSuccess = createAction(LOAD_PROJECTS_SUCCESS, props<{ projects: Project[] }>());
export const loadProjectsError = createAction(LOAD_PROJECTS_ERROR, props<{ error: string }>());

export const loadProject = createAction(LOAD_PROJECT, props<{ projectId: number }>());
export const loadProjectSuccess = createAction(LOAD_PROJECT_SUCCESS, props<{ project: Project }>());
export const loadProjectError = createAction(LOAD_PROJECT_ERROR, props<{ error: string }>());

export const createProject = createAction(CREATE_PROJECT, props<{ projectCreate: ProjectCreate }>());
export const createProjectSuccess = createAction(CREATE_PROJECT_SUCCESS, props<{ project: Project }>());
export const createProjectError = createAction(CREATE_PROJECT_ERROR, props<{ error: string }>());

export const acceptOffer = createAction(ACCEPT_OFFER, props<{ contractId: number, contract: ProjectContract }>());
export const acceptOfferSuccess = createAction(ACCEPT_OFFER_SUCCESS, props<{ contract: ProjectContract }>());
export const acceptOfferError = createAction(ACCEPT_OFFER_ERROR, props<{ error: string }>());

export const completeContract = createAction(COMPLETE_CONTRACT, props<{ contractId: number, contract: ProjectContract }>());
export const completeContractSuccess = createAction(COMPLETE_CONTRACT_SUCCESS, props<{ contract: ProjectContract }>());
export const completeContractError = createAction(COMPLETE_CONTRACT_ERROR, props<{ error: string }>());

export const makeNewOffer = createAction(MAKE_NEW_OFFER, props<{ contractId: number, contract: ProjectContract }>());
export const makeNewOfferSuccess = createAction(MAKE_NEW_OFFER_SUCCESS, props<{ contract: ProjectContract }>());
export const makeNewOfferError = createAction(MAKE_NEW_OFFER_ERROR, props<{ error: string }>());

export const rejectOffer = createAction(REJECT_OFFER, props<{ contractId: number, contract: ProjectContract }>());
export const rejectOfferSuccess = createAction(REJECT_OFFER_SUCCESS, props<{ contract: ProjectContract }>());
export const rejectOfferError = createAction(REJECT_OFFER_ERROR, props<{ error: string }>());

export const resumeContract = createAction(RESUME_CONTRACT, props<{ contractId: number, contract: ProjectContract }>());
export const resumeContractSuccess = createAction(RESUME_CONTRACT_SUCCESS, props<{ contract: ProjectContract }>());
export const resumeContractError = createAction(RESUME_CONTRACT_ERROR, props<{ error: string }>());

export const signContract = createAction(SING_CONTRACT, props<{ contractId: number, contract: ProjectContract }>());
export const signContractSuccess = createAction(SING_CONTRACT_SUCCESS, props<{ contract: ProjectContract }>());
export const signContractError = createAction(SING_CONTRACT_ERROR, props<{ error: string }>());

export const terminateContract = createAction(TERMINATE_CONTRACT, props<{ contractId: number, contract: ProjectContract }>());
export const terminateContractSuccess = createAction(TERMINATE_CONTRACT_SUCCESS, props<{ contract: ProjectContract }>());
export const terminateContractError = createAction(TERMINATE_CONTRACT_ERROR, props<{ error: string }>());

export const projectNeedsRefresh = createAction(PROJECT_NEEDS_REFRESH);

