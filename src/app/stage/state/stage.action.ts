import {createAction, props} from "@ngrx/store";
import {Stage} from "../stage";

const STAGES = "[STAGES]";

const LOAD_STAGES_FOR_PROJECT = `${STAGES} Load stages for project`;
const LOAD_STAGES_FOR_PROJECT_SUCCESS = `${STAGES} Load stages for project success`;
const LOAD_STAGES_FOR_PROJECT_ERROR = `${STAGES} Load stages for project error`;

export const loadStagesForProject = createAction(LOAD_STAGES_FOR_PROJECT, props<{ projectId: number }>());
export const loadStagesForProjectSuccess = createAction(LOAD_STAGES_FOR_PROJECT_SUCCESS, props<{ stages: Stage[] }>())
export const loadStagesForProjectError = createAction(LOAD_STAGES_FOR_PROJECT_ERROR, props<{ error: string }>())

