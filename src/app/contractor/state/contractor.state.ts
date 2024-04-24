import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Contractor} from "../../generated/models/contractor";

export interface ContractorState extends AppState {
    contractors: Contractor[];
    contractor: Contractor | null;
    contractorsNeedRefresh: boolean
}

export const initialState: ContractorState = {
    contractors: [],
    contractor: null,
    contractorsNeedRefresh: true
}

const getContractorFeatureState = createFeatureSelector<ContractorState>(Features.CONTRACTOR);

export const getContractors = createSelector(
    getContractorFeatureState,
    state => state.contractors
)

export const getContractorsNeedRefresh = createSelector(
    getContractorFeatureState,
    state => state.contractorsNeedRefresh
)
