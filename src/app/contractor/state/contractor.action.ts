import {createAction, props} from "@ngrx/store";
import {Contractor} from "../../generated/models/contractor";

const CONTRACTOR = '[CONTRACTORS]';

const LOAD_CONTRACTORS = `${CONTRACTOR} Load contractors`;
const LOAD_CONTRACTORS_SUCCESS = `${CONTRACTOR} Load contractors success`;
const LOAD_CONTRACTORS_ERROR = `${CONTRACTOR} Load contractors error`;

export const loadContractors = createAction(LOAD_CONTRACTORS);
export const loadContractorsSuccess = createAction(LOAD_CONTRACTORS_SUCCESS, props<{ contractors: Contractor[] }>());
export const loadContractorsError = createAction(LOAD_CONTRACTORS_ERROR, props<{ error: string }>());
