import {createAction, props} from "@ngrx/store";
import {Contractor} from "../../generated/models/contractor";

const CONTRACTORS = '[CONTRACTORS]';

const LOAD_CONTRACTORS = `${CONTRACTORS} Load contractors`;
const LOAD_CONTRACTORS_SUCCESS = `${CONTRACTORS} Load contractors success`;
const LOAD_CONTRACTORS_ERROR = `${CONTRACTORS} Load contractors error`;

const CREATE_CONTRACTOR = `${CONTRACTORS} Create contractor`;
const CREATE_CONTRACTOR_SUCCESS = `${CONTRACTORS} Create contractor success`;
const CREATE_CONTRACTOR_ERROR = `${CONTRACTORS} Create contractor error`;

export const loadContractors = createAction(LOAD_CONTRACTORS);
export const loadContractorsSuccess = createAction(LOAD_CONTRACTORS_SUCCESS, props<{ contractors: Contractor[] }>());
export const loadContractorsError = createAction(LOAD_CONTRACTORS_ERROR, props<{ error: string }>());

export const createContractor = createAction(CREATE_CONTRACTOR, props<{ contractor: Contractor }>());
export const createContractorSuccess = createAction(CREATE_CONTRACTOR_SUCCESS, props<{ contractor: Contractor }>());
export const createContractorError = createAction(CREATE_CONTRACTOR_ERROR, props<{ error: string }>());
