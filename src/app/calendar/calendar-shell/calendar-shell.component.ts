import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {CalendarStore} from "../state";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {CalendarViewComponent} from "../calendar-view/calendar-view.component";
import {UpcomingEventsComponent} from "../upcoming-events/upcoming-events.component";
import {AddCalendarEventComponent} from "../add-calendar-event/add-calendar-event.component";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ButtonModule} from "primeng/button";
import {DateRange, EventSelection} from "../model/calendar.model";

@Component({
    selector: 'calendar-shell',
    templateUrl: './calendar-shell.component.html',
    styleUrl: './calendar-shell.component.less',
    standalone: true,
    imports: [CalendarViewComponent, UpcomingEventsComponent, AddCalendarEventComponent, ConfirmDialogModule, ButtonModule]
})
export class CalendarShellComponent implements OnInit {

    readonly calendarStore = inject(CalendarStore);

    $events: Signal<CalendarEvent[]> = this.calendarStore.events;
    $upcomingEvents: Signal<CalendarEvent[]> = this.calendarStore.upcomingEvents;
    $eventsNeedRefresh: Signal<boolean> = this.calendarStore.eventsNeedRefresh;
    $upcomingEventsNeedRefresh: Signal<boolean> = this.calendarStore.upcomingEventsNeedRefresh;

    showAddEventComponent = false;
    selectedEvent: CalendarEvent | null = null;
    prefillSelection: EventSelection | null = null;

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$eventsNeedRefresh()) {
                this.calendarStore.loadEvents({});
            }
        });
        effect(() => {
            if (this.$upcomingEventsNeedRefresh()) {
                this.calendarStore.loadUpcomingEvents({});
            }
        });
    }

    ngOnInit(): void {
        this.calendarStore.loadUpcomingEvents({});
    }

    onRangeChange(range: DateRange): void {
        this.calendarStore.setVisibleRange(range);
    }

    onSlotSelected(selection: EventSelection): void {
        this.prefillSelection = selection;
        this.selectedEvent = null;
        this.calendarStore.setSelectedEvent(null);
        this.showAddEventComponent = true;
    }

    onEventSelected(eventId: number): void {
        const event = this.$events().find(event => event.id === eventId);
        if (event) {
            this.openEditDialog(event);
        }
    }

    onAddEvent(): void {
        this.prefillSelection = null;
        this.selectedEvent = null;
        this.calendarStore.setSelectedEvent(null);
        this.showAddEventComponent = true;
    }

    onEditEvent(event: CalendarEvent): void {
        this.openEditDialog(event);
    }

    onDialogNotify(): void {
        this.showAddEventComponent = false;
        this.selectedEvent = null;
        this.prefillSelection = null;
    }

    onDeleteEvent(event: CalendarEvent): void {
        this.confirmationService.confirm({
            message: `Do you want to delete event ${event.name}?`,
            header: `Confirm event delete ${event.name}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.calendarStore.deleteCalendarEvent({eventId: event.id!});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }

    private openEditDialog(event: CalendarEvent): void {
        this.calendarStore.setSelectedEvent(event);
        this.selectedEvent = event;
        this.prefillSelection = null;
        this.showAddEventComponent = true;
    }
}
