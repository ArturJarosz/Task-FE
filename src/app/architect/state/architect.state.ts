import {AppState} from "../../state/app.store";
import {Architect} from "../model/architect";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../features";

export interface ArchitectState extends AppState {
    error: string;
    architects: Architect[];
    architect: Architect | null;
}

export const initialState: ArchitectState = {
    error: '',
    architects: [],
    architect: null
}

const getArchitectFeatureState = createFeatureSelector<ArchitectState>(Features.ARCHITECT);

export const getArchitects = createSelector(
    getArchitectFeatureState,
    state => state.architects
)

export const getArchitect = createSelector(
    getArchitectFeatureState,
    state => state.architect
)
