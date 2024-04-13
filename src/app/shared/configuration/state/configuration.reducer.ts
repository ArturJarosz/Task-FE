import {createReducer, on} from "@ngrx/store";
import {ConfigurationState, initialState} from "./configuration.state";
import {loadConfigurationSuccess} from "./configuration.action";

export const configurationReducer = createReducer<ConfigurationState>(
    initialState,
    on(loadConfigurationSuccess, (state, action): ConfigurationState => {
        return {
            ...state,
            error: '',
            configuration: action.configuration,
            needRefresh: false
        }
    })
)
