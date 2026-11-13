import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CalendarEvent} from "../../generated/models/calendar-event";
import {Client} from "../../generated/models/client";
import {Project} from "../../generated/models/project";
import {clientDisplayName} from "../../client/model/client";
import {GoogleSyncIssue, isWaitingForGoogle} from "../model/calendar.model";
import {GoogleSyncTagComponent} from "../google-sync-tag/google-sync-tag.component";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";
import {EmptyStateComponent} from "../../shared";
import {eventCountLabel, eventDay, eventMonth, eventTime} from "../../shared/utils/event-date-utils";

@Component({
    selector: 'upcoming-events',
    templateUrl: './upcoming-events.component.html',
    styleUrl: './upcoming-events.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, MenuModule, TooltipModule, EmptyStateComponent, GoogleSyncTagComponent]
})
export class UpcomingEventsComponent {
    @Input()
    events: CalendarEvent[] = [];
    @Input()
    title = 'Upcoming events';
    @Input()
    emptyTitle = 'No upcoming events';
    @Input()
    emptyText = '';
    // Grey date tiles instead of brand ones, for events that already happened
    @Input()
    muted = false;
    // Events there are before the list's limit, when it has one
    @Input()
    totalEvents?: number;
    @Input()
    clients: Client[] = [];
    @Input()
    projects: Project[] = [];
    // Shown next to the title, and events not sent to Google say so, while sync has an issue
    @Input()
    syncIssue: GoogleSyncIssue | null = null;
    @Input()
    syncTag = true;
    @Input()
    syncChecking = false;

    @Output()
    editEvent: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
    @Output()
    deleteEvent: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
    @Output()
    recheckSync = new EventEmitter<void>();

    protected readonly isWaitingForGoogle = isWaitingForGoogle;
    protected readonly eventDay = eventDay;
    protected readonly eventMonth = eventMonth;
    protected readonly eventTime = eventTime;
    rowMenuItems: MenuItem[] = [];

    get countLabel(): string {
        return eventCountLabel(this.events.length, this.totalEvents ?? this.events.length);
    }

    clientName(event: CalendarEvent): string {
        return clientDisplayName(this.clients.find(client => client.id === event.clientId));
    }

    projectName(event: CalendarEvent): string {
        return this.projects.find(project => project.id === event.projectId)?.name ?? '';
    }

    openRowMenu($event: MouseEvent, event: CalendarEvent, menu: Menu) {
        this.rowMenuItems = [
            {label: 'Edit event', icon: 'pi pi-pencil', command: () => this.editEvent.emit(event)},
            {label: 'Delete event', icon: 'pi pi-trash', command: () => this.deleteEvent.emit(event)},
        ];
        menu.toggle($event);
    }
}
