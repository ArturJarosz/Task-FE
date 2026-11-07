import {Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges} from '@angular/core';
import {FullCalendarModule} from '@fullcalendar/angular';
import {CalendarOptions, DateSelectArg, EventClickArg, EventHoveringArg, EventInput, EventMountArg} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {CalendarEvent} from "../../generated/models/calendar-event";
import {Client} from "../../generated/models/client";
import {Project} from "../../generated/models/project";
import {clientDisplayName} from "../../client/model/client";
import {DateRange, EventSelection, SYNC_LABELS} from "../model/calendar.model";
import {eventWhen} from "../../shared/utils/event-date-utils";
import {toTimeZoneString} from "../../shared/utils/date-utils";

const WORKDAY_START_HOUR = 7;
const WORKDAY_END_HOUR = 20;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_GAP = 8;

interface EventTooltip {
    name?: string;
    when: string;
    client: string;
    project?: string;
    description?: string;
    sync?: string;
    left: number;
    // Below the event, or above it where no room is left: bottom is then the distance from the window's bottom
    top?: number;
    bottom?: number;
}

@Component({
    selector: 'calendar-view',
    templateUrl: './calendar-view.component.html',
    styleUrl: './calendar-view.component.less',
    standalone: true,
    imports: [FullCalendarModule]
})
export class CalendarViewComponent implements OnChanges {
    @Input()
    events: CalendarEvent[] = [];
    @Input()
    clients: Client[] = [];
    @Input()
    projects: Project[] = [];

    readonly tooltip = signal<EventTooltip | null>(null);
    // The app returns focus to this event when its dialog closes, which must not open the tooltip
    private openedEventId: string | null = null;

    @Output()
    rangeChange: EventEmitter<DateRange> = new EventEmitter<DateRange>();
    @Output()
    slotSelected: EventEmitter<EventSelection> = new EventEmitter<EventSelection>();
    @Output()
    eventSelected: EventEmitter<number> = new EventEmitter<number>();

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        buttonText: {today: 'Today', month: 'Month', week: 'Week'},
        firstDay: 1,
        dayMaxEvents: 3,
        eventTimeFormat: {hour: '2-digit', minute: '2-digit', hour12: false},
        slotLabelFormat: {hour: '2-digit', minute: '2-digit', hour12: false},
        // Overlapping events share the day's width instead of covering each other
        slotEventOverlap: false,
        slotMinTime: toSlotTime(WORKDAY_START_HOUR),
        slotMaxTime: toSlotTime(WORKDAY_END_HOUR),
        height: 'auto',
        nowIndicator: true,
        selectable: true,
        events: [],
        eventMouseEnter: (arg: EventHoveringArg) => {
            this.openedEventId = null;
            this.showTooltip(arg.event.id, arg.el);
        },
        eventMouseLeave: () => this.tooltip.set(null),
        // Events take keyboard focus, so the details open on focus too
        eventDidMount: (arg: EventMountArg) => {
            arg.el.addEventListener('focusin', () => this.onEventFocus(arg.event.id, arg.el));
            arg.el.addEventListener('focusout', () => this.tooltip.set(null));
        },
        datesSet: (arg) => {
            this.tooltip.set(null);
            this.rangeChange.emit({
                startDate: toTimeZoneString(arg.start)!,
                endDate: toTimeZoneString(arg.end)!,
            });
        },
        select: (arg: DateSelectArg) => {
            this.slotSelected.emit({
                date: arg.start,
                // FullCalendar's all-day end is exclusive; the app stores the last selected day
                endDate: arg.allDay ? addDays(arg.end, -1) : arg.end,
                allDay: arg.allDay,
            });
        },
        eventClick: (arg: EventClickArg) => {
            this.openedEventId = arg.event.id;
            this.tooltip.set(null);
            this.eventSelected.emit(Number(arg.event.id));
        }
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['events']) {
            this.calendarOptions = {
                ...this.calendarOptions,
                events: this.mapEvents(this.events),
                ...weekViewHours(this.events),
            };
        }
    }

    // Only keyboard focus: a click focuses the event too, and the mouse has its own handlers
    private onEventFocus(eventId: string, element: HTMLElement): void {
        if (eventId !== this.openedEventId && element.matches(':focus-visible')) {
            this.showTooltip(eventId, element);
        }
    }

    private showTooltip(eventId: string, element: HTMLElement): void {
        const event = this.events.find(event => String(event.id) === eventId);
        if (!event) {
            return;
        }
        const box = element.getBoundingClientRect();
        const below = window.innerHeight - box.bottom > box.top;
        this.tooltip.set({
            name: event.name,
            when: eventWhen(event),
            client: clientDisplayName(this.clients.find(client => client.id === event.clientId)),
            project: this.projects.find(project => project.id === event.projectId)?.name,
            description: event.description,
            sync: event.syncStatus ? SYNC_LABELS[event.syncStatus] : undefined,
            left: Math.max(TOOLTIP_GAP, Math.min(box.left, window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_GAP)),
            top: below ? box.bottom + TOOLTIP_GAP : undefined,
            bottom: below ? undefined : window.innerHeight - box.top + TOOLTIP_GAP,
        });
    }

    private mapEvents(events: CalendarEvent[]): EventInput[] {
        return events.map(event => ({
            id: String(event.id),
            title: event.name,
            start: event.startDateTime,
            // All-day events store their last day, FullCalendar expects the day after it
            end: event.allDay && event.endDateTime ? addDays(new Date(event.endDateTime), 1) : event.endDateTime,
            allDay: event.allDay,
        }));
    }
}

// Working hours, extended so that no timed event of the loaded range is cut off
export function weekViewHours(events: CalendarEvent[]): {slotMinTime: string, slotMaxTime: string} {
    let startHour = WORKDAY_START_HOUR;
    let endHour = WORKDAY_END_HOUR;
    for (const event of events) {
        if (event.allDay || !event.startDateTime) {
            continue;
        }
        const start = new Date(event.startDateTime);
        const end = event.endDateTime ? new Date(event.endDateTime) : start;
        // An event ending at midnight fills the rest of its day, it doesn't run into the next one
        const endsAtMidnight = end > start && end.getHours() === 0 && end.getMinutes() === 0;
        const lastMoment = endsAtMidnight ? new Date(end.getTime() - 1) : end;
        if (start.toDateString() !== lastMoment.toDateString()) {
            // It runs through midnight, so it fills the end of one day and the start of the next
            startHour = 0;
            endHour = 24;
            continue;
        }
        startHour = Math.min(startHour, start.getHours());
        const lastMinuteHour = endsAtMidnight ? 24 : end.getHours() + (end.getMinutes() > 0 ? 1 : 0);
        // An event without a duration still takes up an hour's row
        endHour = Math.max(endHour, lastMinuteHour, start.getHours() + 1);
    }
    return {slotMinTime: toSlotTime(startHour), slotMaxTime: toSlotTime(endHour)};
}

function toSlotTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00:00`;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
