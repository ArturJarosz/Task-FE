import {AppState} from "../../state/app.store";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";
import {Architect} from "../../generated/models/architect";

export interface ArchitectState extends AppState {
    error: string;
    architects: Architect[];
    architect: Architect | null;
    architectsNeedRefresh: boolean;
}

export const initialState: ArchitectState = {
    error: '',
    architects: [],
    architect: null,
    architectsNeedRefresh: false
}

// selectors

const getArchitectFeatureState = createFeatureSelector<ArchitectState>(Features.ARCHITECT);

export const getArchitects = createSelector(
    getArchitectFeatureState,
    state => state.architects
)

export const getArchitect = createSelector(
    getArchitectFeatureState,
    state => state.architect
)

export const architectsNeedRefresh = createSelector(
    getArchitectFeatureState,
    state => state.architectsNeedRefresh
)
