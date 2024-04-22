import {createAction, props} from "@ngrx/store";
import {Architect} from "../../generated/models/architect";

const ARCHITECT = "[ARCHITECTS]";

const LOAD_ARCHITECTS = `${ARCHITECT} Load architects`;
const LOAD_ARCHITECTS_SUCCESS = `${ARCHITECT} Load architects success`;
const LOAD_ARCHITECTS_ERROR = `${ARCHITECT} Load architects error`;

const LOAD_ARCHITECT = `${ARCHITECT} Load architect`;
const LOAD_ARCHITECT_SUCCESS = `${ARCHITECT} Load architect success`;
const LOAD_ARCHITECT_ERROR = `${ARCHITECT} Load architect error`;

export const loadArchitects = createAction(LOAD_ARCHITECTS);
export const loadArchitectsSuccess = createAction(LOAD_ARCHITECTS_SUCCESS, props<{ architects: Architect[] }>());
export const loadArchitectsError = createAction(LOAD_ARCHITECTS_ERROR, props<{ error: string }>());

export const loadArchitect = createAction(LOAD_ARCHITECT, props<{ architectId: number }>());
export const loadArchitectSuccess = createAction(LOAD_ARCHITECT_SUCCESS, props<{ architect: Architect }>());
export const loadArchitectError = createAction(LOAD_ARCHITECT_ERROR, props<{ error: string }>());
