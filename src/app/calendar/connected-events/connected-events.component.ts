import {ChangeDetectionStrategy, Component, computed, effect, inject, Input, OnChanges, signal} from '@angular/core';
import {ConfirmationService} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {CalendarStore} from "../state/calendar.state";
import {ClientStore} from "../../client/state/client.state";
import {ProjectStore} from "../../project/state/project.state";
import {SystemParameterStore} from "../../settings/state/system-parameter.state";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {EmptyStateComponent} from "../../shared/empty-state/empty-state.component";
import {UpcomingEventsComponent} from "../upcoming-events/upcoming-events.component";
import {AddCalendarEventComponent} from "../add-calendar-event/add-calendar-event.component";

type EventsPeriod = 'upcoming' | 'past';

// Events of one project or client, or all of them when given neither, with adding and editing;
// the page around it provides the confirm dialog
@Component({
    selector: 'connected-events',
    templateUrl: './connected-events.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, EmptyStateComponent, UpcomingEventsComponent, AddCalendarEventComponent]
})
export class ConnectedEventsComponent implements OnChanges {
    @Input()
    clientId?: number;
    // With a project the list shows its events, and clientId is only the client of its new events
    @Input()
    projectId?: number;
    // The page's primary button, an outline one next to other primary actions, or none when the page has its own
    @Input()
    addButton: 'primary' | 'outline' | 'none' = 'outline';

    readonly calendarStore = inject(CalendarStore);
    readonly clientStore = inject(ClientStore);
    readonly projectStore = inject(ProjectStore);
    readonly systemParameterStore = inject(SystemParameterStore);
    private readonly confirmationService = inject(ConfirmationService);

    readonly period = signal<EventsPeriod>('upcoming');
    // Today's events are upcoming, as on the calendar page
    readonly upcomingEvents = computed(() => this.calendarStore.connectedEvents()
        .filter(event => !this.isPast(event))
        .sort((a, b) => (a.startDateTime ?? '').localeCompare(b.startDateTime ?? '')));
    readonly pastEvents = computed(() => this.calendarStore.connectedEvents()
        .filter(event => this.isPast(event))
        .sort((a, b) => (b.startDateTime ?? '').localeCompare(a.startDateTime ?? '')));

    // Nearest first in both, so the limits keep the events closest to today
    readonly shownUpcomingEvents = computed(() =>
        this.upcomingEvents().slice(0, this.systemParameterStore.upcomingEventsShown()));
    readonly shownPastEvents = computed(() =>
        this.pastEvents().slice(0, this.systemParameterStore.pastEventsShown()));

    dialogVisible = false;
    selectedEvent: CalendarEvent | null = null;

    constructor() {
        effect(() => {
            if (this.calendarStore.connectedEventsNeedRefresh()) {
                this.reload();
            }
        });
    }

    ngOnChanges(): void {
        this.reload();
        this.clientStore.loadClients({});
        this.projectStore.loadProjects({});
    }

    reload(): void {
        this.calendarStore.loadConnectedEvents(
            this.projectId ? {projectId: this.projectId} : {clientId: this.clientId});
    }

    onAddEvent(): void {
        this.calendarStore.setSelectedEvent(null);
        this.selectedEvent = null;
        this.dialogVisible = true;
    }

    onEditEvent(event: CalendarEvent): void {
        this.calendarStore.setSelectedEvent(event);
        this.selectedEvent = event;
        this.dialogVisible = true;
    }

    onDialogNotify(): void {
        this.dialogVisible = false;
        this.selectedEvent = null;
    }

    onDeleteEvent(event: CalendarEvent): void {
        this.confirmationService.confirm({
            header: 'Delete event',
            message: `Delete ${event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.calendarStore.deleteCalendarEvent({eventId: event.id!});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    private isPast(event: CalendarEvent): boolean {
        return (event.endDateTime ?? '').slice(0, 10) < toTimeZoneString(new Date())!;
    }
}
