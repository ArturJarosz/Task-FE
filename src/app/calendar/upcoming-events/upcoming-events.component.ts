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
import {eventDay, eventMonth, eventWhen} from "../../shared/utils/event-date-utils";

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
    protected readonly eventDay = eventDay;
    protected readonly eventMonth = eventMonth;
    protected readonly eventWhen = eventWhen;
    rowMenuItems: MenuItem[] = [];

    getSyncLabel(status?: CalendarEventSyncStatus): string {
        return status ? SYNC_LABELS[status] : '';
    }

    openRowMenu($event: MouseEvent, event: CalendarEvent, menu: Menu) {
        this.rowMenuItems = [
            {label: 'Edit event', icon: 'pi pi-pencil', command: () => this.editEvent.emit(event)},
            {label: 'Delete event', icon: 'pi pi-trash', command: () => this.deleteEvent.emit(event)},
        ];
        menu.toggle($event);
    }
}
