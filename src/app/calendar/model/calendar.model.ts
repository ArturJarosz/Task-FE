import {CalendarEventSyncStatus} from "../../generated/models/calendar-event-sync-status";
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

export const SYNC_LABELS: Record<CalendarEventSyncStatus, string> = {
    [CalendarEventSyncStatus.SYNCED]: 'Synced',
    [CalendarEventSyncStatus.PENDING]: 'Pending',
    [CalendarEventSyncStatus.DELETE_PENDING]: 'Removing',
};
