import {createReducer, on} from "@ngrx/store";
import {ArchitectState, initialState} from "./architect.state";
import {loadArchitectsSuccess, loadArchitectSuccess} from "./architect.action";

export const architectReducer = createReducer<ArchitectState>(
    initialState,
    on(loadArchitectsSuccess, (state, action): ArchitectState => {
        return {
            ...state,
            error: '',
            architects: action.architects
        }
    }),
    on(loadArchitectSuccess, (state, action): ArchitectState => {
        return {
            ...state,
            error: '',
            architect: action.architect
        }
    }),
)
