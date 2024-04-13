import {AppState} from "../../state/app.store";
import {Stage} from "../stage";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

export interface StageState extends AppState {
    error: string,
    stages: Stage[],
    stage: Stage | null,
    stagesNeedRefresh: boolean
}

export const initialState: StageState = {
    error: '',
    stages: [],
    stage: null,
    stagesNeedRefresh: false
}

// selectors

const getStageFeatureState = createFeatureSelector<StageState>(Features.STAGE);

export const getStages = createSelector(
    getStageFeatureState,
    state => state.stages
)

export const getStage = createSelector(
    getStageFeatureState,
    state => state.stage
)

export const getStagesNeedRefresh = createSelector(
    getStageFeatureState,
    state => state.stagesNeedRefresh
)
