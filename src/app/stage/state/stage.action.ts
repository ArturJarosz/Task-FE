import {createAction, props} from "@ngrx/store";
import {Stage} from "../../generated/models/stage";

const STAGES = "[STAGES]";

const LOAD_STAGES_FOR_PROJECT = `${STAGES} Load stages for project`;
const LOAD_STAGES_FOR_PROJECT_SUCCESS = `${STAGES} Load stages for project success`;
const LOAD_STAGES_FOR_PROJECT_ERROR = `${STAGES} Load stages for project error`;

const LOAD_STAGE = `${STAGES} Load stage`;
const LOAD_STAGE_SUCCESS = `${STAGES} Load stage success.`;
const LOAD_STAGE_ERROR = `${STAGES} Load stage error`;

const REFRESH_STAGE = `${STAGES} Refresh stage`;

export const loadStagesForProject = createAction(LOAD_STAGES_FOR_PROJECT, props<{ projectId: number }>());
export const loadStagesForProjectSuccess = createAction(LOAD_STAGES_FOR_PROJECT_SUCCESS, props<{ stages: Stage[] }>())
export const loadStagesForProjectError = createAction(LOAD_STAGES_FOR_PROJECT_ERROR, props<{ error: string }>())

export const loadStage = createAction(LOAD_STAGE, props<{ projectId: number, stageId: number }>());
export const loadStageSuccess = createAction(LOAD_STAGE_SUCCESS, props<{ stage: Stage }>());
export const loadStageError = createAction(LOAD_STAGE_ERROR, props<{ error: string }>());

export const refreshStage = createAction(REFRESH_STAGE);
