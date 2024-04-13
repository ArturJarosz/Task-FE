import {createReducer, on} from "@ngrx/store";
import {initialState, StageState} from "./stage.state";
import {loadStagesForProjectSuccess, loadStageSuccess} from "./stage.action";

export const stageReducer = createReducer<StageState>(
    initialState,
    on(loadStagesForProjectSuccess, (state, action): StageState => {
        return {
            ...state,
            error: '',
            stages: action.stages,
            stagesNeedRefresh: false
        }
    }),

    on (loadStageSuccess, (state, action): StageState => {
        return {
            ...state,
            error: '',
            stage: action.stage,
            stagesNeedRefresh: false
        }
    })
)
