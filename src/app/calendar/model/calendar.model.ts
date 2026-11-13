import {CalendarEvent} from "../../generated/models/calendar-event";
import {CalendarEventSyncStatus} from "../../generated/models/calendar-event-sync-status";
import {GoogleCalendarConnectionStatus} from "../../generated/models/google-calendar-connection-status";
export enum CalendarViewMode {
    MONTH = 'dayGridMonth',
    WEEK = 'timeGridWeek'
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface EventSelection {
    date: Date;
    endDate?: Date;
    allDay: boolean;
}

// What an events list on a project or client page is for; a project wins over its client
export interface EventConnection {
    clientId?: number;
    projectId?: number;
}

// Why events don't reach Google Calendar: every connection status but Connected, or UNKNOWN when the app couldn't ask
// the server. A working sync has no issue, and then the app shows nothing about it
export type GoogleSyncIssue = Exclude<`${GoogleCalendarConnectionStatus}`, 'CONNECTED'> | 'UNKNOWN';

export interface GoogleSyncIssueText {
    label: string;
    icon: string;
    // What it means for the events; the tag's tooltip
    hint: string;
    // The line in the event dialog
    eventHint: string;
    // What clicking the tag does, for screen readers: open Settings › Google Calendar, or check the connection again
    actionLabel: string;
    action: 'settings' | 'recheck';
}

const WAITING = 'New and changed events wait and are sent once it\'s fixed.';

export const GOOGLE_SYNC_ISSUES: Record<GoogleSyncIssue, GoogleSyncIssueText> = {
    NOT_CONFIGURED: {
        label: 'Google Calendar not set up',
        icon: 'pi pi-calendar-times',
        hint: 'Events stay in this app. Add a service account key and turn sync on to send them to Google.',
        eventHint: 'Saved in this app only, as Google Calendar isn\'t set up',
        actionLabel: 'Set up sync',
        action: 'settings',
    },
    DISABLED: {
        label: 'Google sync turned off',
        icon: 'pi pi-pause-circle',
        hint: 'Events stay in this app until sync is turned on again.',
        eventHint: 'Saved in this app only, as Google sync is turned off',
        actionLabel: 'Turn sync on',
        action: 'settings',
    },
    INVALID_CREDENTIALS: {
        label: 'Google key rejected',
        icon: 'pi pi-key',
        hint: `Google rejected the service account key. ${WAITING}`,
        eventHint: 'Sent to Google once the service account key is replaced',
        actionLabel: 'Replace key',
        action: 'settings',
    },
    PERMISSION_DENIED: {
        label: 'No access to Google Calendar',
        icon: 'pi pi-lock',
        hint: `Google refused access to the calendar. ${WAITING}`,
        eventHint: 'Sent to Google once access to the calendar is restored',
        actionLabel: 'Open settings',
        action: 'settings',
    },
    CALENDAR_NOT_FOUND: {
        label: 'Google calendar not found',
        icon: 'pi pi-exclamation-circle',
        hint: `The synced calendar was deleted or the service account lost access to it. ${WAITING}`,
        eventHint: 'Sent to Google once the synced calendar is found again',
        actionLabel: 'Open settings',
        action: 'settings',
    },
    CONNECTION_FAILED: {
        label: 'Can\'t reach Google',
        icon: 'pi pi-wifi',
        hint: 'The server couldn\'t reach Google Calendar. New and changed events are sent once it\'s back.',
        eventHint: 'Sent to Google once the server can reach it again',
        actionLabel: 'Check again',
        action: 'recheck',
    },
    UNKNOWN: {
        label: 'Sync status unknown',
        icon: 'pi pi-question-circle',
        hint: 'Couldn\'t ask the server whether events reach Google Calendar. Check your connection and try again.',
        eventHint: 'Couldn\'t check whether events reach Google Calendar',
        actionLabel: 'Try again',
        action: 'recheck',
    },
};

// An event Google doesn't have yet; worth a mention only while sync is known not to work, as a working sync sends it
// at once (and UNKNOWN may be a working sync the app just couldn't ask about)
export function isWaitingForGoogle(event: CalendarEvent, issue: GoogleSyncIssue | null): boolean {
    return issue !== null && issue !== 'UNKNOWN' && event.syncStatus === CalendarEventSyncStatus.PENDING;
}
