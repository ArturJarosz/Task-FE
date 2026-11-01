import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {CurrencyPipe, DatePipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {differenceInCalendarDays, format, startOfDay} from "date-fns";
import {TagModule} from "primeng/tag";
import {TooltipModule} from "primeng/tooltip";
import {ButtonModule} from "primeng/button";
import {Project} from "../../generated/models/project";
import {Installment} from "../../generated/models/installment";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry, StageStatus} from "../../generated/models";
import {EmptyStateComponent, KpiCardComponent, NotSetComponent} from "../../shared";
import {resolveLabel} from "../../shared/utils/label-utils";
import {updateAtMidnight} from "../../shared/utils/date-utils";
import {isDeposit} from "../../finance/installment/installment-utils";
import {
    dayCount,
    emptySpan,
    END_BEFORE_START,
    endsBeforeStart,
    isDate,
    LabelSpot,
    MIN_CHART_WIDTH_PX,
    relativeDays,
    spanOf,
    TimelineScale,
    TimelineSpan,
    TimelineStretch,
    TimelineTick,
    toDay
} from "../timeline/timeline-scale";

export type {LabelPlacement, LabelSpot, TimelineSpan, TimelineStretch, TimelineTick} from "../timeline/timeline-scale";

// paid; due: not paid and its payment date is today or later; overdue: not paid and its payment date has passed
export type PaymentState = 'paid' | 'due' | 'overdue';

// An installment's payment date, drawn as an 18px circle on the row of its stage (the deposit's on the contract row)
export interface TimelinePayment {
    id?: number;
    // "Deposit" or "Installment", the tooltip title
    name: string;
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

const DONE_WITHOUT_END = 'Done, but the stage has no end date';

@Component({
    selector: 'project-timeline',
    templateUrl: './project-timeline.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [KpiCardComponent, EmptyStateComponent, TagModule, TooltipModule, ButtonModule, RouterLink, DatePipe, CurrencyPipe, NgTemplateOutlet, NotSetComponent]
})
export class ProjectTimelineComponent implements OnChanges {
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
    scale: TimelineScale = new TimelineScale(this.today);
    rangeStart?: Date;
    rangeEnd?: Date;
    chartMinWidth: number = MIN_CHART_WIDTH_PX;
    ticks: TimelineTick[] = [];
    todayLeft: number | null = null;
    // Keeps the "Today" label inside the chart when today is near either edge
    todayLabelClass: string = 'left-1/2 -translate-x-1/2';

    stages: TimelineStage[] = [];
    // The deposit is for the whole project under the contract, not a stage, so it goes on the contract row
    contractPayments: TimelinePayment[] = [];
    // Payments whose stage isn't on the project; they go on the project row
    otherPayments: TimelinePayment[] = [];

    elapsedDays: number = 0;
    elapsedPercent: number = 0;
    stagesDone: number = 0;
    installmentsPaid: number = 0;
    installmentsCount: number = 0;
    daysToDeadline: number | null = null;

    constructor() {
        // Today moves at midnight: redraw then, so the Today line, overdue payments and relative days stay right
        updateAtMidnight(() => this.refresh());
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
        this.contract = spanOf(contractStart, contractEnd);

        this.start = toDay(this.project.startDate);
        this.end = toDay(this.project.endDate);
        this.endBeforeStart = endsBeforeStart(this.start, this.end);
        this.openEnded = !!this.start && !this.end;
        this.work = spanOf(this.start, this.end);
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
        this.scale = TimelineScale.around(dates, anyOpen, this.today);
        this.rangeStart = this.scale.rangeStart;
        this.rangeEnd = this.scale.rangeEnd;
        this.ticks = this.scale.ticks;
        this.chartMinWidth = this.scale.chartMinWidth;
        this.todayLeft = this.scale.todayLeft;
        this.todayLabelClass = this.scale.todayLabelClass;
    }

    resolvePositions(): void {
        let stages = this.project.stages ?? [];
        let stageIds = new Set(stages.map(stage => stage.id));
        let payments = this.allInstallments()
            .filter(installment => !!installment.paymentDate)
            .map(installment => ({installment, payment: this.toPayment(installment)}));
        this.contractPayments = payments
            .filter(({installment}) => isDeposit(installment))
            .map(({payment}) => payment);
        this.contract = this.placeSpan(this.contract, this.contractDeadline,
            this.contractPayments.map(payment => payment.left));
        this.otherPayments = payments
            .filter(({installment}) => !isDeposit(installment) && !stageIds.has(installment.stageId))
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

    // The bar maths lives in TimelineScale, shared with the projects timeline view
    barEnd(span: TimelineSpan): Date | undefined {
        return this.scale.barEnd(span);
    }

    pastDeadline(start?: Date, end?: Date, deadline?: Date): TimelineStretch | undefined {
        return this.scale.pastDeadline(start, end, deadline);
    }

    toDeadline(open: boolean, barEnd: Date, deadline?: Date): TimelineStretch | undefined {
        return this.scale.toDeadline(open, barEnd, deadline);
    }

    placeSpan(span: TimelineSpan, deadline?: Date, markers: number[] = []): TimelineSpan {
        return this.scale.placeSpan(span, deadline, markers);
    }

    placeLabel(left: number, width: number, label: string, tail: number = 0, markers: number[] = []): LabelSpot {
        return this.scale.placeLabel(left, width, label, tail, markers);
    }

    labelBefore(left: number): string {
        return this.scale.labelBefore(left);
    }

    position(date: Date): number {
        return this.scale.position(date);
    }

    span(start: Date, end: Date): number {
        return this.scale.span(start, end);
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

    private toPayment(installment: Installment): TimelinePayment {
        let date = toDay(installment.paymentDate)!;
        let state: PaymentState = installment.paid ? 'paid' : date < this.today ? 'overdue' : 'due';
        return {
            id: installment.id, name: isDeposit(installment) ? 'Deposit' : 'Installment', date: date,
            value: installment.value, paid: !!installment.paid, state: state,
            stateLabel: PAYMENT_LABEL[state], left: this.position(date)
        };
    }
}

const PAYMENT_LABEL: Record<PaymentState, string> = {
    paid: 'Paid',
    due: 'Not paid',
    overdue: 'Overdue'
};

function isOpenStage(stage: Stage, today: Date): boolean {
    let start = toDay(stage.startDate);
    return !!start && start <= today && !stage.endDate
        && stage.status !== StageStatus.DONE && stage.status !== StageStatus.REJECTED;
}

// For a stage with a start but no bar: when it starts, or that it has no end
function stageNote(start: Date, today: Date): string {
    return start > today ? `Starts ${format(start, 'dd.MM.yyyy')}` : `From ${format(start, 'dd.MM.yyyy')}, no end date`;
}

