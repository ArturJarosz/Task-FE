// One place that decides the color of every status tag in the app.
// Keys are the backend status enums from src/app/generated/models; values are p-tag severities.

import {CalendarEventSyncStatus} from '../generated/models/calendar-event-sync-status';
import {ContractStatus} from '../generated/models/contract-status';
import {GoogleCalendarConnectionStatus} from '../generated/models/google-calendar-connection-status';
import {ProjectStatus} from '../generated/models/project-status';
import {StageStatus} from '../generated/models/stage-status';
import {TaskStatus} from '../generated/models/task-status';

export type TagSeverity = 'secondary' | 'info' | 'warn' | 'success' | 'danger' | 'contrast';

export type Status = ProjectStatus | StageStatus | TaskStatus | ContractStatus | CalendarEventSyncStatus
    | GoogleCalendarConnectionStatus;

// Several enums share values (TO_DO, DONE, REJECTED, COMPLETED...), so the map is keyed by the string value.
// Adding a value to any of the enums above makes this a compile error until it gets a severity.
const SEVERITY: Record<`${Status}`, TagSeverity> = {
    // Project, stage and task
    TO_DO: 'info',
    IN_PROGRESS: 'warn',
    DONE: 'success',
    COMPLETED: 'success',
    REJECTED: 'danger',
    // Contract
    OFFER: 'secondary',
    ACCEPTED: 'info',
    SIGNED: 'info',
    TERMINATED: 'danger',
    // Calendar event sync
    PENDING: 'warn',
    SYNCED: 'success',
    DELETE_PENDING: 'warn',
    // Google Calendar connection
    DISABLED: 'secondary',
    NOT_CONFIGURED: 'secondary',
    CONNECTED: 'success',
    INVALID_CREDENTIALS: 'danger',
    PERMISSION_DENIED: 'danger',
    CALENDAR_NOT_FOUND: 'danger',
    CONNECTION_FAILED: 'danger',
};

export function statusSeverity(status: Status | string | null | undefined): TagSeverity {
    return (status && SEVERITY[status as `${Status}`]) || 'secondary';
}

// Usage in a template (label comes from the configuration entries via resolveLabel()):
//   <p-tag [value]="resolveLabel(project.status, statuses)" [severity]="statusSeverity(project.status)" />
// Expose it in the component:  protected readonly statusSeverity = statusSeverity;
