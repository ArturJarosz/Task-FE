import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CalendarEvent} from "../../generated/models/calendar-event";
import {CalendarEventSyncStatus} from "../../generated/models/calendar-event-sync-status";
import {TagModule} from "primeng/tag";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";
import {EmptyStateComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";

const SYNC_LABELS: Record<CalendarEventSyncStatus, string> = {
    [CalendarEventSyncStatus.SYNCED]: 'Synced',
    [CalendarEventSyncStatus.PENDING]: 'Sync pending',
    [CalendarEventSyncStatus.DELETE_PENDING]: 'Removing',
};

@Component({
    selector: 'upcoming-events',
    templateUrl: './upcoming-events.component.html',
    styleUrl: './upcoming-events.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TagModule, ButtonModule, MenuModule, TooltipModule, EmptyStateComponent]
})
export class UpcomingEventsComponent {
    @Input()
    events: CalendarEvent[] = [];

    @Output()
    editEvent: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
    @Output()
    deleteEvent: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

    protected readonly statusSeverity = statusSeverity;
    rowMenuItems: MenuItem[] = [];

    getSyncLabel(status?: CalendarEventSyncStatus): string {
        return status ? SYNC_LABELS[status] : '';
    }

    getDay(dateTime?: string): string {
        return dateTime ? new Date(dateTime).getDate().toString().padStart(2, '0') : '';
    }

    getMonth(dateTime?: string): string {
        return dateTime ? new Date(dateTime).toLocaleString('en-GB', {month: 'short'}) : '';
    }

    getWhen(event: CalendarEvent): string {
        const start = event.startDateTime ? new Date(event.startDateTime) : undefined;
        const end = event.endDateTime ? new Date(event.endDateTime) : undefined;
        const day = (date?: Date) => date ? date.toLocaleDateString('pl-PL', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '';
        const time = (date?: Date) => date ? date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'}) : '';
        if (event.allDay) {
            return `${day(start)} · All day`;
        }
        return `${day(start)} · ${time(start)}–${time(end)}`;
    }

    openRowMenu($event: MouseEvent, event: CalendarEvent, menu: Menu) {
        this.rowMenuItems = [
            {label: 'Edit event', icon: 'pi pi-pencil', command: () => this.editEvent.emit(event)},
            {label: 'Delete event', icon: 'pi pi-trash', command: () => this.deleteEvent.emit(event)},
        ];
        menu.toggle($event);
    }
}
