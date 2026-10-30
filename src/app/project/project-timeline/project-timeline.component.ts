import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnInit,
    Output
} from '@angular/core';
import {CurrencyPipe, DatePipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    format,
    parseISO,
    startOfDay,
    startOfMonth
} from "date-fns";
import {TagModule} from "primeng/tag";
import {TooltipModule} from "primeng/tooltip";
import {ButtonModule} from "primeng/button";
import {Project} from "../../generated/models/project";
import {Installment} from "../../generated/models/installment";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry, StageStatus} from "../../generated/models";
import {EmptyStateComponent, KpiCardComponent, NotSetComponent} from "../../shared";
import {resolveLabel} from "../../shared/utils/label-utils";

// Where a bar's label goes: inside it, or next to it when the bar is too short to hold it
export type LabelPlacement = 'inside' | 'after' | 'before';

// Where a bar's label goes; left: CSS left edge when it is after the bar; pad: percent of the chart width to shift it
// right inside the bar
export interface LabelSpot {
    at: LabelPlacement;
    left: string;
    pad: number;
}
// paid; due: not paid and its payment date is today or later; overdue: not paid and its payment date has passed
export type PaymentState = 'paid' | 'due' | 'overdue';

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

// An installment's payment date, drawn as an 18px circle on the row of its stage
export interface TimelinePayment {
    id?: number;
    date: Date;
    value?: number;
    paid: boolean;
    state: PaymentState;
    stateLabel: string;
    left: number;
}

export interface TimelineStage {
    id: number;
    name: string;
    start?: Date;
    end?: Date;
    days: number;
    left: number;
    width: number;
    statusLabel: string;
    barClass: string;
    // Started, not done and without an end: drawn up to today, then dashed on to its deadline if that is still ahead
    open: boolean;
    // Done but without an end date: a data error, flagged on the row instead of a bar
    missingEnd: boolean;
    // A data error (done without an end, or an end before the start), flagged on the row instead of a bar
    dateError?: string;
    // A start but nothing to draw yet (not started, or rejected without an end): the row says when it starts
    note?: string;
    deadline?: Date;
    // Length for the tooltip; stage bars carry no text
    label: string;
    // The stretch of the bar past its deadline, striped
    pastDeadline?: TimelineStretch;
    // For an open bar, the dashed stretch from today to a deadline still ahead
    toDeadline?: TimelineStretch;
    payments: TimelinePayment[];
}

// Width of one column of the chart, so a long project scrolls sideways instead of squeezing its labels
const MONTH_WIDTH_PX = 96;
const MIN_CHART_WIDTH_PX = 720;
// Rough width of one character of a 14px bar label
const LABEL_CHAR_PX = 7;
// Gap between a payment marker and a label placed just past it
const MARKER_GAP_PX = 18;
// Half the width of an 18px payment marker
const MARKER_RADIUS_PX = 9;
// Days of room before the first date and after the last one on the chart (about a marker's radius at 96px a month)
const EDGE_ROOM_DAYS = 4;

const END_BEFORE_START = 'The end date is before the start date';
const DONE_WITHOUT_END = 'Done, but the stage has no end date';

@Component({
    selector: 'project-timeline',
    templateUrl: './project-timeline.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [KpiCardComponent, EmptyStateComponent, TagModule, TooltipModule, ButtonModule, RouterLink, DatePipe, CurrencyPipe, NgTemplateOutlet, NotSetComponent]
})
export class ProjectTimelineComponent implements OnInit, OnChanges {
    @Input()
    project!: Project;
    @Input()
    installments: Installment[] | null = [];
    @Input()
    stageStatuses: ConfigurationEntry[] | null = [];
    @Input()
    installmentsLoadFailed: boolean = false;
    @Output()
    reloadInstallments: EventEmitter<void> = new EventEmitter<void>();

    private readonly changeDetector = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);
    private midnightTimer?: ReturnType<typeof setTimeout>;

    today: Date = startOfDay(new Date());

    // The contract: its own start, end and deadline, drawn above the work
    contract: TimelineSpan = emptySpan();
    contractDeadline?: Date;

    // The work on the project: only the project's own start and end, never the contract's or the stages'
    start?: Date;
    end?: Date;
    openEnded: boolean = false;
    // The project's end date is before its start: a data error, so no duration or progress
    endBeforeStart: boolean = false;
    work: TimelineSpan = emptySpan();
    durationDays: number = 0;
    durationMonths: number = 0;

    // Chart range, snapped to whole months around every date on the chart
    rangeStart?: Date;
    rangeEnd?: Date;
    chartMinWidth: number = MIN_CHART_WIDTH_PX;
    ticks: TimelineTick[] = [];
    todayLeft: number | null = null;
    // Keeps the "Today" label inside the chart when today is near either edge
    todayLabelClass: string = 'left-1/2 -translate-x-1/2';

    stages: TimelineStage[] = [];
    // Payments whose stage isn't on the project; they go on the project row
    otherPayments: TimelinePayment[] = [];

    elapsedDays: number = 0;
    elapsedPercent: number = 0;
    stagesDone: number = 0;
    installmentsPaid: number = 0;
    installmentsCount: number = 0;
    daysToDeadline: number | null = null;

    ngOnInit(): void {
        this.scheduleMidnightRefresh();
        this.destroyRef.onDestroy(() => clearTimeout(this.midnightTimer));
    }

    ngOnChanges(): void {
        this.refresh();
    }

    refresh(): void {
        if (!this.project) {
            return;
        }
        this.today = startOfDay(new Date());
        this.resolveStartAndEnd();
        this.resolveRange();
        this.resolvePositions();
        this.resolveProgress();
    }

    // Each row from its own dates only: the contract from the contract, the project from the project
    resolveStartAndEnd(): void {
        let contract = this.project.contract;
        this.contractDeadline = toDay(contract?.deadline);
        let contractStart = toDay(contract?.startDate);
        let contractEnd = toDay(contract?.endDate);
        // An end before the start is a data error: flagged, never drawn as an open bar
        this.contract = {
            ...emptySpan(), start: contractStart, end: contractEnd, open: !!contractStart && !contractEnd,
            dateError: endsBeforeStart(contractStart, contractEnd) ? END_BEFORE_START : undefined
        };

        this.start = toDay(this.project.startDate);
        this.end = toDay(this.project.endDate);
        this.endBeforeStart = endsBeforeStart(this.start, this.end);
        this.openEnded = !!this.start && !this.end;
        this.work = {
            ...emptySpan(), start: this.start, end: this.end, open: this.openEnded,
            dateError: this.endBeforeStart ? END_BEFORE_START : undefined
        };
        this.durationDays = this.start && this.end && !this.endBeforeStart ? differenceInCalendarDays(this.end, this.start) + 1 : 0;
        this.durationMonths = this.durationDays > 0 ? Math.max(Math.round(this.durationDays / 30.44), 1) : 0;
    }

    resolveRange(): void {
        let stages = this.project.stages ?? [];
        let dates = [this.start, this.end, this.contract.start, this.contract.end, this.contractDeadline,
            ...stages.flatMap(stage => [toDay(stage.startDate), toDay(stage.endDate), toDay(stage.deadline)]),
            ...this.allInstallments().map(installment => toDay(installment.paymentDate))]
            .filter(isDate);
        // An open bar reaches today, so today has to be on the chart
        let anyOpen = this.openEnded || this.contract.open || stages.some(stage => isOpenStage(stage, this.today));
        if (anyOpen) {
            dates.push(this.today);
        }
        if (dates.length === 0) {
            this.rangeStart = undefined;
            this.rangeEnd = undefined;
            this.ticks = [];
            return;
        }
        // A few days of room on both sides, so a marker on the first or last day isn't cut in half by the edge
        let first = addDays(earliest(dates)!, -EDGE_ROOM_DAYS);
        let last = addDays(latest(dates)!, EDGE_ROOM_DAYS);
        // Room after the last date for the "Today" label when an open bar ends today
        if (anyOpen) {
            last = addDays(last, 14);
        }
        this.rangeStart = startOfMonth(first);
        this.rangeEnd = addMonths(startOfMonth(last), 1);

        this.ticks = [];
        let tick = this.rangeStart;
        while (tick < this.rangeEnd) {
            this.ticks.push({label: format(tick, "MMM''yy"), left: this.position(tick)});
            tick = addMonths(tick, 1);
        }
        let months = differenceInCalendarMonths(this.rangeEnd, this.rangeStart);
        this.chartMinWidth = Math.max(months * MONTH_WIDTH_PX, MIN_CHART_WIDTH_PX);
    }

    resolvePositions(): void {
        this.contract = this.placeSpan(this.contract, this.contractDeadline);
        this.todayLeft = this.rangeStart && this.rangeEnd && this.today >= this.rangeStart && this.today < this.rangeEnd
            ? this.position(this.today) : null;
        this.todayLabelClass = this.todayLeft === null || (this.todayLeft > 6 && this.todayLeft < 94) ? 'left-1/2 -translate-x-1/2'
            : this.todayLeft <= 6 ? '-left-0.5' : '-right-0.5';

        let stages = this.project.stages ?? [];
        let stageIds = new Set(stages.map(stage => stage.id));
        let payments = this.allInstallments()
            .filter(installment => !!installment.paymentDate)
            .map(installment => ({installment, payment: this.toPayment(installment)}));
        this.otherPayments = payments
            .filter(({installment}) => !stageIds.has(installment.stageId))
            .map(({payment}) => payment);
        this.work = this.placeSpan(this.work, undefined, this.otherPayments.map(payment => payment.left));

        this.stages = stages.map((stage): TimelineStage => {
            let start = toDay(stage.startDate);
            let ownEnd = toDay(stage.endDate);
            let endBeforeStart = endsBeforeStart(start, ownEnd);
            let open = isOpenStage(stage, this.today);
            // A stage ends only at its own end date, never at its deadline
            let end = endBeforeStart ? undefined : ownEnd ?? (open ? this.today : undefined);
            let deadline = toDay(stage.deadline);
            let done = stage.status === StageStatus.DONE;
            // Done stages always get an end date (the backend sets it when the stage completes), so one without is a data error
            let missingEnd = done && !!start && !stage.endDate;
            let dateError = endBeforeStart ? END_BEFORE_START : missingEnd ? DONE_WITHOUT_END : undefined;
            let statusLabel = resolveLabel(stage.status?.toString() ?? '', this.stageStatuses ?? []);
            let days = start && end ? differenceInCalendarDays(end, start) + 1 : 0;
            let label = `${dayCount(days)}${open ? ' so far' : ''}`;
            return {
                id: stage.id!,
                name: stage.name ?? '',
                start: start,
                end: end,
                days: days,
                left: start ? this.position(start) : 0,
                width: start && end ? this.span(start, end) : 0,
                statusLabel: statusLabel,
                // Done or not, a stage is blue; only a rejected one is grey
                barClass: stage.status === StageStatus.REJECTED ? 'bg-gray-200' : 'bg-brand-200',
                open: open,
                missingEnd: missingEnd,
                dateError: dateError,
                note: start && !end && !dateError ? stageNote(start, this.today) : undefined,
                deadline: deadline,
                label: label,
                pastDeadline: this.pastDeadline(start, end, deadline),
                toDeadline: end ? this.toDeadline(open, end, deadline) : undefined,
                payments: payments.filter(({installment}) => installment.stageId === stage.id).map(({payment}) => payment)
            };
        }).sort((a, b) => (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity));
    }

    resolveProgress(): void {
        let elapsed = this.start ? Math.max(differenceInCalendarDays(this.today, this.start) + 1, 0) : 0;
        this.elapsedDays = this.durationDays > 0 ? Math.min(elapsed, this.durationDays) : elapsed;
        this.elapsedPercent = this.durationDays > 0 ? Math.round(this.elapsedDays / this.durationDays * 100) : 0;
        this.stagesDone = (this.project.stages ?? []).filter(stage => stage.status === StageStatus.DONE).length;
        let installments = this.allInstallments();
        this.installmentsCount = installments.length;
        this.installmentsPaid = installments.filter(installment => installment.paid).length;
        this.daysToDeadline = this.contractDeadline ? differenceInCalendarDays(this.contractDeadline, this.today) : null;
    }

    readonly dayCount = dayCount;

    get anyDateError(): boolean {
        return !!this.contract.dateError || !!this.work.dateError || this.stages.some(stage => !!stage.dateError);
    }

    relativeDays(date?: Date): string {
        return date ? relativeDays(date, this.today) : '';
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

    // The project's installments, plus any a stage carries that the list doesn't have yet
    private allInstallments(): Installment[] {
        let installments = this.installments ?? [];
        let ids = new Set(installments.map(installment => installment.id));
        let fromStages = (this.project.stages ?? [])
            .filter(stage => stage.installment && !ids.has(stage.installment.id))
            .map(stage => ({...stage.installment!, stageId: stage.installment!.stageId ?? stage.id}));
        return [...installments, ...fromStages];
    }

    // Today moves at midnight: redraw then, so the Today line, overdue payments and relative days stay right
    private scheduleMidnightRefresh(): void {
        let untilMidnight = addDays(startOfDay(new Date()), 1).getTime() - Date.now();
        this.midnightTimer = setTimeout(() => {
            this.refresh();
            this.changeDetector.markForCheck();
            this.scheduleMidnightRefresh();
        }, untilMidnight + 1000);
    }

    private toPayment(installment: Installment): TimelinePayment {
        let date = toDay(installment.paymentDate)!;
        let state: PaymentState = installment.paid ? 'paid' : date < this.today ? 'overdue' : 'due';
        return {
            id: installment.id, date: date, value: installment.value, paid: !!installment.paid, state: state,
            stateLabel: PAYMENT_LABEL[state], left: this.position(date)
        };
    }
}

const PAYMENT_LABEL: Record<PaymentState, string> = {
    paid: 'Paid',
    due: 'Not paid',
    overdue: 'Overdue'
};

function emptySpan(): TimelineSpan {
    return {open: false, days: 0, left: 0, width: 0, label: '', labelAt: 'inside', labelLeft: '', labelPad: 0};
}

function isOpenStage(stage: Stage, today: Date): boolean {
    let start = toDay(stage.startDate);
    return !!start && start <= today && !stage.endDate
        && stage.status !== StageStatus.DONE && stage.status !== StageStatus.REJECTED;
}

function endsBeforeStart(start?: Date, end?: Date): boolean {
    return !!start && !!end && end < start;
}

// For a stage with a start but no bar: when it starts, or that it has no end
function stageNote(start: Date, today: Date): string {
    return start > today ? `Starts ${format(start, 'dd.MM.yyyy')}` : `From ${format(start, 'dd.MM.yyyy')}, no end date`;
}

function isDate(date: Date | undefined): date is Date {
    return !!date;
}

function earliest(dates: Date[]): Date | undefined {
    return dates.length ? new Date(Math.min(...dates.map(date => date.getTime()))) : undefined;
}

function latest(dates: Date[]): Date | undefined {
    return dates.length ? new Date(Math.max(...dates.map(date => date.getTime()))) : undefined;
}

// parseISO reads a date-only "yyyy-MM-dd" as local midnight (new Date() reads it as UTC, a day early west of UTC)
function toDay(value?: string): Date | undefined {
    return value ? startOfDay(parseISO(value)) : undefined;
}

// "1 day", "12 days"
function dayCount(days: number): string {
    return days === 1 ? '1 day' : `${days} days`;
}

function relativeDays(date: Date, today: Date): string {
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
