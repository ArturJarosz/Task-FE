import {createAction, props} from "@ngrx/store";
import {ApplicationConfiguration} from "../model/configuration";

const CONFIGURATION = "[CONFIGURATION]";

const LOAD_CONFIGURATION = `${CONFIGURATION} Load configuration`;
const LOAD_CONFIGURATION_SUCCESS = `${CONFIGURATION} Load configuration success`;
const LOAD_CONFIGURATION_ERROR = `${CONFIGURATION} Load configuration error`;

export const loadConfiguration = createAction(LOAD_CONFIGURATION);
export const loadConfigurationSuccess = createAction(LOAD_CONFIGURATION_SUCCESS, props<{
    configuration: ApplicationConfiguration
}>());
export const loadConfigurationError = createAction(LOAD_CONFIGURATION_ERROR, props<{ error: string }>());
