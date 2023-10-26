import {createAction, props} from "@ngrx/store";
import {Project} from "../project";

const PROJECTS = "[PROJECTS]";

const LOAD_PROJECTS = `${PROJECTS} Load projects`;
const LOAD_PROJECTS_SUCCESS = `${PROJECTS} Load projects success`;
const LOAD_PROJECTS_ERROR = `${PROJECTS} Load projects error`;

export const loadProjects = createAction(LOAD_PROJECTS);
export const loadProjectsSuccess = createAction(LOAD_PROJECTS_SUCCESS, props<{ projects: Project[] }>());
export const loadProjectsError = createAction(LOAD_PROJECTS_ERROR, props<{ error: string }>());
