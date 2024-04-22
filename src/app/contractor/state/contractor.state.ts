import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Contractor} from "../../generated/models/contractor";

export interface ContractorState extends AppState {
    contractors: Contractor[];
}

export const initialState: ContractorState = {
    contractors: []
}

const getContractorFeatureState = createFeatureSelector<ContractorState>(Features.CONTRACTOR);

export const getContractors = createSelector(
    getContractorFeatureState,
    state => state.contractors
)
