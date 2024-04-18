import {AppState} from "../../../state/app.store";
import {Cost} from "../../model/finance";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../../features";

export interface CostState extends AppState {
    error: string,
    cost: Cost | null
}

export const initialState: CostState = {
    error: '',
    cost: null
}

// selectors

const getCostFeatureState = createFeatureSelector<CostState>(Features.COST);

export const getCost = createSelector(
    getCostFeatureState,
    state => state.cost
)
