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
