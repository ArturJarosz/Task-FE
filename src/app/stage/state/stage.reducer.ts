import {createReducer, on} from "@ngrx/store";
import {initialState, StageState} from "./stage.state";
import {loadStagesForProjectSuccess} from "./stage.action";

export const stageReducer = createReducer<StageState>(
    initialState,
    on(loadStagesForProjectSuccess, (state, action): StageState => {
        return {
            ...state,
            error: '',
            stages: action.stages,
            stagesNeedRefresh: false
        }
    })
)
