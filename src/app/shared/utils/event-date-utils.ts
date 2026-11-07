import {CalendarEvent} from "../../generated/models/calendar-event";

// Helpers for the event lists on the dashboard and the calendar page

const formatDay = (date: Date) => date.toLocaleDateString('pl-PL', {day: '2-digit', month: '2-digit', year: 'numeric'});
const formatTime = (date: Date) => date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'});
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// Day of the month for the date badge, "05"
export function eventDay(dateTime?: string): string {
    return dateTime ? new Date(dateTime).getDate().toString().padStart(2, '0') : '';
}

// Short month for the date badge, "Oct"
export function eventMonth(dateTime?: string): string {
    return dateTime ? new Date(dateTime).toLocaleString('en-GB', {month: 'short'}) : '';
}

// "20.10.2026 · 09:00–17:00", or with both dates when the event spans several days
// (all-day events store their last day as the end date)
export function eventWhen(event: CalendarEvent): string {
    if (!event.startDateTime) {
        return '';
    }
    const start = new Date(event.startDateTime);
    const end = event.endDateTime ? new Date(event.endDateTime) : start;
    if (event.allDay) {
        return isSameDay(start, end)
            ? `${formatDay(start)} · All day`
            : `${formatDay(start)} – ${formatDay(end)} · All day`;
    }
    return isSameDay(start, end)
        ? `${formatDay(start)} · ${formatTime(start)}–${formatTime(end)}`
        : `${formatDay(start)} ${formatTime(start)} – ${formatDay(end)} ${formatTime(end)}`;
}

// For rows with a date badge, which already shows the start day: "09:00–17:00", "All day",
// or with the end date when the event spans several days
export function eventTime(event: CalendarEvent): string {
    if (!event.startDateTime) {
        return '';
    }
    const start = new Date(event.startDateTime);
    const end = event.endDateTime ? new Date(event.endDateTime) : start;
    if (event.allDay) {
        return isSameDay(start, end) ? 'All day' : `All day, until ${formatDay(end)}`;
    }
    return isSameDay(start, end)
        ? `${formatTime(start)}–${formatTime(end)}`
        : `${formatTime(start)}, until ${formatDay(end)} ${formatTime(end)}`;
}

// "3 events", or "10 of 23 events" when the list is limited
export function eventCountLabel(shown: number, total: number): string {
    return total > shown ? `${shown} of ${total} events` : `${shown} ${shown === 1 ? 'event' : 'events'}`;
}
