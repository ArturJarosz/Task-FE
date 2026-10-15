import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CalendarEvent} from "../../generated/models/calendar-event";
import {CalendarEventSyncStatus} from "../../generated/models/calendar-event-sync-status";
import {TagModule} from "primeng/tag";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'upcoming-events',
    templateUrl: './upcoming-events.component.html',
    styleUrl: './upcoming-events.component.less',
    standalone: true,
    imports: [TagModule, ButtonModule]
})
export class UpcomingEventsComponent {
    @Input()
    events: CalendarEvent[] = [];

    @Output()
    editEvent: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
    @Output()
    deleteEvent: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

    getSyncStatusSeverity(status?: CalendarEventSyncStatus): 'success' | 'warn' | 'danger' {
        switch (status) {
            case CalendarEventSyncStatus.SYNCED:
                return 'success';
            case CalendarEventSyncStatus.DELETE_PENDING:
                return 'danger';
            default:
                return 'warn';
        }
    }

    getSyncStatusIcon(status?: CalendarEventSyncStatus): string {
        switch (status) {
            case CalendarEventSyncStatus.SYNCED:
                return 'pi pi-check';
            case CalendarEventSyncStatus.DELETE_PENDING:
                return 'pi pi-trash';
            default:
                return 'pi pi-sync';
        }
    }

    getDay(dateTime?: string): string {
        return dateTime ? new Date(dateTime).getDate().toString().padStart(2, '0') : '';
    }

    getMonth(dateTime?: string): string {
        return dateTime ? new Date(dateTime).toLocaleString(undefined, {month: 'short'}) : '';
    }

    getTimeRange(event: CalendarEvent): string {
        if (event.allDay) {
            return 'All day';
        }
        const start = event.startDateTime ? new Date(event.startDateTime) : undefined;
        const end = event.endDateTime ? new Date(event.endDateTime) : undefined;
        const format = (date?: Date) => date ? date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'}) : '';
        return `${format(start)} - ${format(end)}`;
    }
}
