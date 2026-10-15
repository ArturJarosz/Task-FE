import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FullCalendarModule} from '@fullcalendar/angular';
import {CalendarOptions, DateSelectArg, EventClickArg, EventInput} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {CalendarEvent} from "../../generated/models/calendar-event";
import {DateRange, EventSelection} from "../model/calendar.model";
import {toTimeZoneString} from "../../shared/utils/date-utils";

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
        firstDay: 1,
        height: 'auto',
        nowIndicator: true,
        selectable: true,
        events: [],
        datesSet: (arg) => {
            this.rangeChange.emit({
                startDate: toTimeZoneString(arg.start)!,
                endDate: toTimeZoneString(arg.end)!,
            });
        },
        select: (arg: DateSelectArg) => {
            this.slotSelected.emit({
                date: arg.start,
                endDate: arg.end,
                allDay: arg.allDay,
            });
        },
        eventClick: (arg: EventClickArg) => {
            this.eventSelected.emit(Number(arg.event.id));
        }
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['events']) {
            this.calendarOptions = {
                ...this.calendarOptions,
                events: this.mapEvents(this.events)
            };
        }
    }

    private mapEvents(events: CalendarEvent[]): EventInput[] {
        return events.map(event => ({
            id: String(event.id),
            title: event.name,
            start: event.startDateTime,
            end: event.endDateTime,
            allDay: event.allDay,
        }));
    }
}
