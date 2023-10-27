import {createReducer, on} from "@ngrx/store";
import {ContractorState, initialState} from "./contractor.state";
import {loadContractorsSuccess} from "./contractor.action";

export const contractorReducer = createReducer<ContractorState>(
    initialState,
    on(loadContractorsSuccess, (state, action): ContractorState => {
        return {
            ...state,
            contractors: action.contractors
        }
    })
)
