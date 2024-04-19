import {createReducer, on} from "@ngrx/store";
import {CostState, initialState} from "./cost.state";
import {createCostSuccess, loadCostSuccess} from "./cost.actions";

export const costReducer = createReducer<CostState>(
    initialState,
    on(loadCostSuccess, (state, action): CostState => {
        return {
            ...state,
            error: '',
            cost: action.cost
        }
    }),
    on(createCostSuccess, (state, action): CostState => {
        return {
            ...state,
            error: '',
            cost: action.cost
        }
    })
)
