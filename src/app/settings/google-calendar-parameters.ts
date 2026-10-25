import {SystemParameter} from "../generated/models/system-parameter";

// Google Calendar settings are system parameters, edited only under Settings › Google Calendar
export const GOOGLE_CALENDAR_SYNC_PARAMETER = 'Google calendar sync';
export const GOOGLE_CALENDAR_NAME_PARAMETER = 'Google calendar name';
export const GOOGLE_CALENDAR_APPLICATION_NAME_PARAMETER = 'Google calendar application name';
export const GOOGLE_CALENDAR_CREDENTIALS_PARAMETER = 'Google calendar credentials';
export const GOOGLE_CALENDAR_POLL_INTERVAL_PARAMETER = 'Google calendar poll interval';
export const GOOGLE_CALENDAR_PUSH_RETRY_INTERVAL_PARAMETER = 'Google calendar push retry interval';

export const GOOGLE_CALENDAR_PARAMETERS = [GOOGLE_CALENDAR_SYNC_PARAMETER, GOOGLE_CALENDAR_NAME_PARAMETER,
    GOOGLE_CALENDAR_APPLICATION_NAME_PARAMETER, GOOGLE_CALENDAR_CREDENTIALS_PARAMETER,
    GOOGLE_CALENDAR_POLL_INTERVAL_PARAMETER, GOOGLE_CALENDAR_PUSH_RETRY_INTERVAL_PARAMETER];

export interface GoogleCalendarParameters {
    sync?: SystemParameter;
    calendarName?: SystemParameter;
    applicationName?: SystemParameter;
    // SECRET: the value never comes back, only valueSet
    credentials?: SystemParameter;
    // Whole minutes
    pollInterval?: SystemParameter;
    pushRetryInterval?: SystemParameter;
}

export function toGoogleCalendarParameters(systemParameters: SystemParameter[]): GoogleCalendarParameters {
    let byName = (name: string) => systemParameters.find(parameter => parameter.name === name);
    return {
        sync: byName(GOOGLE_CALENDAR_SYNC_PARAMETER),
        calendarName: byName(GOOGLE_CALENDAR_NAME_PARAMETER),
        applicationName: byName(GOOGLE_CALENDAR_APPLICATION_NAME_PARAMETER),
        credentials: byName(GOOGLE_CALENDAR_CREDENTIALS_PARAMETER),
        pollInterval: byName(GOOGLE_CALENDAR_POLL_INTERVAL_PARAMETER),
        pushRetryInterval: byName(GOOGLE_CALENDAR_PUSH_RETRY_INTERVAL_PARAMETER),
    };
}
