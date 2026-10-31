import {addDays, addMonths, differenceInCalendarDays, differenceInCalendarMonths, format, parseISO, startOfDay, startOfMonth} from "date-fns";

// The month axis and bars shared by the project timeline tab and the projects timeline view (DESIGN_GUIDELINES.md,
// "Project timeline tab")

// Where a bar's label goes: inside it, or next to it when the bar is too short to hold it
export type LabelPlacement = 'inside' | 'after' | 'before';

// Where a bar's label goes; left: CSS left edge when it is after the bar; pad: percent of the chart width to shift it
// right inside the bar
export interface LabelSpot {
    at: LabelPlacement;
    left: string;
    pad: number;
}

export interface TimelineTick {
    // Month and short year, "May'25"
    label: string;
    left: number;
}

// A bar from start to end. Started without an end it is open: it runs to today, then dashed on to its deadline if
// that is still ahead
export interface TimelineSpan {
    start?: Date;
    end?: Date;
    open: boolean;
    days: number;
    left: number;
    width: number;
    label: string;
    labelAt: LabelPlacement;
    // Left edge of a label placed after the bar (CSS length)
    labelLeft: string;
    // Shift of a label inside the bar, past a marker on it (percent of the chart width)
    labelPad: number;
    // Dates that can't be drawn (an end before the start): flagged on the row instead of a bar
    dateError?: string;
    // The stretch of the bar past its deadline, striped
    pastDeadline?: TimelineStretch;
    // For an open bar, the dashed stretch from today to a deadline still ahead
    toDeadline?: TimelineStretch;
}

// Part of a row, in percent of the chart width
export interface TimelineStretch {
    left: number;
    width: number;
    // Starts at the bar start, so both ends are rounded
    whole: boolean;
}

// Width of one column of the chart, so a long project scrolls sideways instead of squeezing its labels
export const MONTH_WIDTH_PX = 96;
export const MIN_CHART_WIDTH_PX = 720;
// Rough width of one character of a 14px bar label
const LABEL_CHAR_PX = 7;
// Gap between a payment marker and a label placed just past it
export const MARKER_GAP_PX = 18;
// Half the width of an 18px payment marker
const MARKER_RADIUS_PX = 9;
// Days of room before the first date and after the last one on the chart (about a marker's radius at 96px a month)
const EDGE_ROOM_DAYS = 4;
// Room after the last date for the "Today" label when an open bar ends today
const TODAY_ROOM_DAYS = 14;

export const END_BEFORE_START = 'The end date is before the start date';

// Positions on a chart of whole months, in percent of its width. Without a range (no dates) everything is at 0
export class TimelineScale {
    readonly ticks: TimelineTick[] = [];
    readonly chartMinWidth: number = MIN_CHART_WIDTH_PX;
    // Where today is, or null when it is off the chart
    readonly todayLeft: number | null = null;
    // Keeps the "Today" label inside the chart when today is near either edge
    readonly todayLabelClass: string = 'left-1/2 -translate-x-1/2';

    constructor(readonly today: Date, readonly rangeStart?: Date, readonly rangeEnd?: Date) {
        if (!rangeStart || !rangeEnd) {
            return;
        }
        let tick = rangeStart;
        while (tick < rangeEnd) {
            this.ticks.push({label: format(tick, "MMM''yy"), left: this.position(tick)});
            tick = addMonths(tick, 1);
        }
        this.chartMinWidth = Math.max(differenceInCalendarMonths(rangeEnd, rangeStart) * MONTH_WIDTH_PX, MIN_CHART_WIDTH_PX);
        this.todayLeft = today >= rangeStart && today < rangeEnd ? this.position(today) : null;
        this.todayLabelClass = this.todayLeft === null || (this.todayLeft > 6 && this.todayLeft < 94) ? 'left-1/2 -translate-x-1/2'
            : this.todayLeft <= 6 ? '-left-0.5' : '-right-0.5';
    }

    // Whole months around every date, with a few days of room on both sides, so a marker on the first or last day
    // isn't cut in half by the edge. With an open bar (anyOpen) today is on the chart, with room for its label
    static around(dates: Date[], anyOpen: boolean, today: Date): TimelineScale {
        let all = anyOpen ? [...dates, today] : dates;
        if (all.length === 0) {
            return new TimelineScale(today);
        }
        let first = addDays(earliest(all)!, -EDGE_ROOM_DAYS);
        let last = addDays(latest(all)!, EDGE_ROOM_DAYS);
        if (anyOpen) {
            last = addDays(last, TODAY_ROOM_DAYS);
        }
        return new TimelineScale(today, startOfMonth(first), addMonths(startOfMonth(last), 1));
    }

    // Position of a day on the chart, in percent of its width
    position(date: Date): number {
        if (!this.rangeStart || !this.rangeEnd) {
            return 0;
        }
        return differenceInCalendarDays(date, this.rangeStart) / differenceInCalendarDays(this.rangeEnd, this.rangeStart) * 100;
    }

    // Width of a bar from the first to the last day, both included
    span(start: Date, end: Date): number {
        if (!this.rangeStart || !this.rangeEnd) {
            return 0;
        }
        return Math.max(differenceInCalendarDays(end, start) + 1, 1) / differenceInCalendarDays(this.rangeEnd, this.rangeStart) * 100;
    }

    // An open span runs to today, or one day if it hasn't started yet
    barEnd(span: TimelineSpan): Date | undefined {
        return span.start ? span.end ?? (span.start > this.today ? span.start : this.today) : undefined;
    }

    // From the day after the deadline (or the bar start, if later) to the bar end
    pastDeadline(start?: Date, end?: Date, deadline?: Date): TimelineStretch | undefined {
        if (!start || !end || !deadline || end <= deadline) {
            return undefined;
        }
        let from = addDays(deadline, 1) > start ? addDays(deadline, 1) : start;
        return {left: this.position(from), width: this.span(from, end), whole: from.getTime() === start.getTime()};
    }

    // An open bar runs to today (or is one day long before it starts); from the day after it to its deadline, if that
    // is still ahead
    toDeadline(open: boolean, barEnd: Date, deadline?: Date): TimelineStretch | undefined {
        if (!open || !deadline || deadline <= barEnd) {
            return undefined;
        }
        let from = addDays(barEnd, 1);
        return {left: this.position(from), width: this.span(from, deadline), whole: false};
    }

    // Markers are the positions (in percent) of the payment markers on the bar's row
    placeSpan(span: TimelineSpan, deadline?: Date, markers: number[] = []): TimelineSpan {
        if (!span.start || span.dateError) {
            // A date error is flagged at the start
            return {...span, days: 0, left: span.start ? this.position(span.start) : 0, width: 0};
        }
        let barEnd = this.barEnd(span)!;
        let notStarted = span.open && span.start > this.today;
        let days = notStarted ? 0 : differenceInCalendarDays(barEnd, span.start) + 1;
        let left = this.position(span.start);
        let width = this.span(span.start, barEnd);
        let pastDeadline = this.pastDeadline(span.start, barEnd, deadline);
        let toDeadline = this.toDeadline(span.open, barEnd, deadline);
        // The dates are in the bar's tooltip, so the bar only says how long it is, or when it starts
        let label = notStarted ? `Starts ${relativeDays(span.start, this.today).toLowerCase()}` : `${dayCount(days)}${span.open ? ' so far' : ''}`;
        let placement = this.placeLabel(left, width, label, toDeadline?.width ?? 0, markers);
        return {...span, days, left, width, label, labelAt: placement.at, labelLeft: placement.left, labelPad: placement.pad, pastDeadline, toDeadline};
    }

    // Inside the bar when it fits, shifted right past any marker that would cover it (pad, in px). Otherwise next
    // to it, on a stretch of the row free of its markers (positions in percent): right after the bar (past an open
    // bar's dashed stretch to its deadline, tail in percent), else before it, else just past a marker after the bar.
    // The chart is at least chartMinWidth wide, so this errs on the side of moving the label out.
    placeLabel(left: number, width: number, label: string, tail: number = 0, markers: number[] = []): LabelSpot {
        let pxPerPercent = this.chartMinWidth / 100;
        let needed = label.length * LABEL_CHAR_PX + 24;
        let neededPercent = needed / pxPerPercent;
        let gapPercent = MARKER_GAP_PX / pxPerPercent;
        // A marker reaches its radius to either side; the gap is wider, so each step past a marker moves forward
        let radiusPercent = MARKER_RADIUS_PX / pxPerPercent;
        let blocked = (from: number, to: number) => markers.filter(marker => marker >= from - radiusPercent && marker <= to + radiusPercent);
        let free = (from: number, to: number) => from >= 0 && to <= 100 && blocked(from, to).length === 0;
        if (width * pxPerPercent >= needed) {
            let insideStart = left;
            let blocking = blocked(insideStart, insideStart + neededPercent);
            while (blocking.length > 0 && insideStart + neededPercent <= left + width) {
                insideStart = Math.max(...blocking) + gapPercent;
                blocking = blocked(insideStart, insideStart + neededPercent);
            }
            if (insideStart + neededPercent <= left + width) {
                // In percent, so the shift grows with the chart when it is wider than chartMinWidth
                return {at: 'inside', left: '', pad: insideStart - left};
            }
        }
        let afterBar = left + width + tail + 8 / pxPerPercent;
        if (free(afterBar, afterBar + neededPercent)) {
            return {at: 'after', left: `calc(${left + width + tail}% + 8px)`, pad: 0};
        }
        if (free(left - 8 / pxPerPercent - neededPercent, left + 1)) {
            return {at: 'before', left: '', pad: 0};
        }
        let pastMarker = markers
            .filter(marker => marker >= left + width)
            .sort((a, b) => a - b)
            .find(marker => free(marker + gapPercent, marker + gapPercent + neededPercent));
        return pastMarker === undefined ? {at: 'inside', left: '', pad: 0} : {at: 'after', left: `calc(${pastMarker}% + ${MARKER_GAP_PX}px)`, pad: 0};
    }

    // Right edge of a label placed before a bar
    labelBefore(left: number): string {
        return `calc(${100 - left}% + 8px)`;
    }
}

export function emptySpan(): TimelineSpan {
    return {open: false, days: 0, left: 0, width: 0, label: '', labelAt: 'inside', labelLeft: '', labelPad: 0};
}

// A bar from its own start and end only; an end before the start is a data error, flagged and never drawn as an open bar
export function spanOf(start?: Date, end?: Date): TimelineSpan {
    return {...emptySpan(), start, end, open: !!start && !end, dateError: endsBeforeStart(start, end) ? END_BEFORE_START : undefined};
}

export function endsBeforeStart(start?: Date, end?: Date): boolean {
    return !!start && !!end && end < start;
}

export function isDate(date: Date | undefined): date is Date {
    return !!date;
}

export function earliest(dates: Date[]): Date | undefined {
    return dates.length ? new Date(Math.min(...dates.map(date => date.getTime()))) : undefined;
}

export function latest(dates: Date[]): Date | undefined {
    return dates.length ? new Date(Math.max(...dates.map(date => date.getTime()))) : undefined;
}

// parseISO reads a date-only "yyyy-MM-dd" as local midnight (new Date() reads it as UTC, a day early west of UTC)
export function toDay(value?: string): Date | undefined {
    return value ? startOfDay(parseISO(value)) : undefined;
}

// "1 day", "12 days"
export function dayCount(days: number): string {
    return days === 1 ? '1 day' : `${days} days`;
}

export function relativeDays(date: Date, today: Date): string {
    let days = differenceInCalendarDays(date, today);
    if (days === 0) {
        return 'Today';
    }
    if (days === 1) {
        return 'Tomorrow';
    }
    if (days === -1) {
        return 'Yesterday';
    }
    return days > 0 ? `In ${days} days` : `${-days} days ago`;
}
