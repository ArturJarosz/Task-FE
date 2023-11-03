import {createAction, props} from "@ngrx/store";
import {Project, ProjectCreate} from "../project";

const PROJECTS = "[PROJECTS]";

const LOAD_PROJECTS = `${PROJECTS} Load projects`;
const LOAD_PROJECTS_SUCCESS = `${PROJECTS} Load projects success`;
const LOAD_PROJECTS_ERROR = `${PROJECTS} Load projects error`;

const LOAD_PROJECT = `${PROJECTS} Load project`;
const LOAD_PROJECT_SUCCESS = `${PROJECTS} Load project success`;
const LOAD_PROJECT_ERROR = `${PROJECTS} Load projects error`;

const CREATE_PROJECT = `${PROJECTS} Create project`;
const CREATE_PROJECT_SUCCESS = `${PROJECTS} Create project success`;
const CREATE_PROJECT_ERROR = `${PROJECTS} Create project error`;

export const loadProjects = createAction(LOAD_PROJECTS);
export const loadProjectsSuccess = createAction(LOAD_PROJECTS_SUCCESS, props<{ projects: Project[] }>());
export const loadProjectsError = createAction(LOAD_PROJECTS_ERROR, props<{ error: string }>());

export const loadProject = createAction(LOAD_PROJECT, props<{ projectId: number }>());
export const loadProjectSuccess = createAction(LOAD_PROJECT_SUCCESS, props<{ project: Project }>());
export const loadProjectError = createAction(LOAD_PROJECT_ERROR, props<{ error: string }>());

export const createProject = createAction(CREATE_PROJECT, props<{ projectCreate: ProjectCreate }>());
export const createProjectSuccess = createAction(CREATE_PROJECT_SUCCESS, props<{ project: Project }>());
export const createProjectError = createAction(CREATE_PROJECT_ERROR, props<{ error: string }>());


