import {AppState} from "../../../state/app.store";
import {ApplicationConfiguration} from "../model/configuration";
import {createFeatureSelector, createSelector} from "@ngrx/store";
import {Features} from "../../../features";

export interface ConfigurationState extends AppState {
    error: string;
    configuration: ApplicationConfiguration;
}

export const initialState: ConfigurationState = {
    error: '',
    configuration: {
        supplierTypes: [],
        contractorTypes: [],
        contractStatuses: [],
        projectTypes: [],
        projectStatuses: [],
        stageStatuses: [],
        stageTypes: [],
        taskStatuses: [],
        taskTypes: [],
        clientTypes: []
    }
}

// selectors

export const getConfigurationFeatureState = createFeatureSelector<ConfigurationState>(Features.CONFIGURATION);

export const getProjectTypeConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration.projectTypes
)

export const getProjectStatusConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration.projectStatuses
)

export const getContractorTypeConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration.contractorTypes
)

export const getSupplierTypeConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration.supplierTypes
)

export const getClientTypeConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration.clientTypes
)

export const getContractStatusConfiguration = createSelector(
    getConfigurationFeatureState,
    state => state.configuration.contractStatuses
)
