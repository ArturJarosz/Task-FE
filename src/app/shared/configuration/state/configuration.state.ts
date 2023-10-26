import {AppState} from "../../../state/app.store";
import {ApplicationConfiguration} from "../model/configuration";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../../features";

export interface ConfigurationState extends AppState {
    error: string;
    configuration: ApplicationConfiguration | null;
}

export const initialState: ConfigurationState = {
    error: '',
    configuration: null
}

// selectors

export const getConfigurationFeatureState = createFeatureSelector<ConfigurationState>(Features.CONFIGURATION);

export const getProjectTypeConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration!.projectTypes
)

export const getProjectStatusConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration!.projectStatuses
)
