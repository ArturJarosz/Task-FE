import {createAction, props} from "@ngrx/store";
import {Cost} from "../../model/finance";

const COSTS = "[COSTS]";

const LOAD_COST = `${COSTS} Load cost`;
const LOAD_COST_SUCCESS = `${COSTS} Load cost success`;
const LOAD_COST_ERROR = `${COSTS} Load cost error`;

export const loadCost = createAction(LOAD_COST, props<{ projectId: number, costId: number }>());
export const loadCostSuccess = createAction(LOAD_COST_SUCCESS, props<{ cost: Cost }>());
export const loadCostError = createAction(LOAD_COST_ERROR, props<{ error: string }>());
