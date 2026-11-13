import {ChangeDetectionStrategy, Component, computed, inject, Input, OnChanges, signal} from '@angular/core';
import {CurrencyPipe, DatePipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {DrawerModule} from "primeng/drawer";
import {SkeletonModule} from "primeng/skeleton";
import {TagModule} from "primeng/tag";
import {ProjectHistoryStore} from "../state/project-history.state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {HistoryEntry} from "../../generated/models/history-entry";
import {HistoryChange} from "../../generated/models/history-change";
import {HistoryField} from "../../generated/models/history-field";
import {HistoryRecordType} from "../../generated/models/history-record-type";
import {HistoryAction} from "../../generated/models/history-action";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {EmptyStateComponent} from "../../shared/empty-state/empty-state.component";
import {TableFooterComponent} from "../../shared/table-footer/table-footer.component";
import {initials, resolveLabel} from "../../shared/utils/label-utils";
import {toTimeZoneString, updateAtMidnight} from "../../shared/utils/date-utils";
import {statusSeverity} from "../../shared/status-severity";

type HistoryPart = 'all' | HistoryRecordType;

const PARTS: { part: HistoryPart, label: string }[] = [
    {part: 'all', label: 'All'},
    {part: HistoryRecordType.PROJECT, label: 'Project'},
    {part: HistoryRecordType.CONTRACT, label: 'Contract'},
    {part: HistoryRecordType.STAGE, label: 'Stages'},
    {part: HistoryRecordType.TASK, label: 'Tasks'},
];

const FIELD_LABELS: Record<HistoryField, string> = {
    NAME: 'Name',
    TYPE: 'Type',
    ARCHITECT: 'Architect',
    STATUS: 'Status',
    START_DATE: 'Start date',
    END_DATE: 'End date',
    DEADLINE: 'Deadline',
    SIGNING_DATE: 'Signing date',
    OFFER_VALUE: 'Offer value',
    NOTE: 'Note',
};

const DATE_FIELDS: HistoryField[] = [HistoryField.START_DATE, HistoryField.END_DATE, HistoryField.DEADLINE,
    HistoryField.SIGNING_DATE];

function recordKey(entry: HistoryEntry): string {
    return `${entry.recordType}-${entry.recordId}`;
}

// Entries of one day of the current page
interface HistoryDay {
    date: string;
    entries: HistoryEntry[];
}

// Who changed what, latest first, in a panel that the History action of a project, stage or task page opens. Without a
// stage it shows the project, its contract, stages and tasks, with a filter by part; with a stage it
// shows the stage and its tasks, with a task only the task
@Component({
    selector: 'project-history',
    templateUrl: './project-history.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, DrawerModule, SkeletonModule, TagModule, RouterLink, DatePipe, CurrencyPipe, NgTemplateOutlet,
        EmptyStateComponent, TableFooterComponent]
})
export class ProjectHistoryComponent implements OnChanges {
    @Input({required: true})
    projectId!: number;
    @Input()
    stageId?: number;
    @Input()
    taskId?: number;

    readonly historyStore = inject(ProjectHistoryStore);
    readonly configurationStore = inject(ConfigurationStore);

    readonly parts = PARTS;
    readonly fieldLabels = FIELD_LABELS;
    readonly action = HistoryAction;
    readonly statusSeverity = statusSeverity;
    readonly initials = initials;

    // The inputs as a signal, so the entries below follow them
    private readonly scope = signal<{ stageId?: number, taskId?: number }>({});
    readonly shown = signal(false);
    readonly part = signal<HistoryPart>('all');
    readonly page = signal(0);
    // Notes are long, so a changed note shows its text only when asked
    readonly shownNotes = signal<ReadonlySet<string>>(new Set());
    readonly today = signal(toTimeZoneString(new Date())!);

    readonly scoped = computed(() => this.scope().stageId !== undefined);
    readonly pageSize = 10;
    // The store loads only the entries of the stage or task when scoped
    private readonly history = computed(() => this.historyStore.history() ?? []);
    private readonly removedRecords = computed(() => new Set(this.history()
        .filter(entry => entry.action === HistoryAction.REMOVED)
        .map(recordKey)));
    readonly entries = computed(() => this.part() === 'all'
        ? this.history()
        : this.history().filter(entry => entry.recordType === this.part()));
    readonly days = computed(() => {
        const start = this.page() * this.pageSize;
        const days: HistoryDay[] = [];
        for (const entry of this.entries().slice(start, start + this.pageSize)) {
            const date = entry.dateTime!.slice(0, 10);
            if (days.at(-1)?.date !== date) {
                days.push({date: date, entries: []});
            }
            days.at(-1)!.entries.push(entry);
        }
        return days;
    });

    constructor() {
        updateAtMidnight(() => this.today.set(toTimeZoneString(new Date())!));
    }

    ngOnChanges(): void {
        this.scope.set({stageId: this.stageId, taskId: this.taskId});
        this.page.set(0);
    }

    // Opens on the latest changes of the whole record, as a new change is what one usually looks for
    open(): void {
        this.part.set('all');
        this.page.set(0);
        this.shown.set(true);
        this.reload();
    }

    reload(): void {
        this.historyStore.setScope({projectId: this.projectId, stageId: this.stageId, taskId: this.taskId});
        this.historyStore.loadHistory();
    }

    onPartChange(part: HistoryPart): void {
        this.part.set(part);
        this.page.set(0);
    }

    partCount(part: HistoryPart): number {
        return part === 'all'
            ? this.history().length
            : this.history().filter(entry => entry.recordType === part).length;
    }

    entryKey(entry: HistoryEntry): string {
        return `${entry.dateTime}-${entry.recordType}-${entry.recordId}`;
    }

    // "added task", "changed the contract": the words before the record's name
    actionText(entry: HistoryEntry): string {
        const verb = entry.action === HistoryAction.CREATED
            ? (entry.recordType === HistoryRecordType.PROJECT ? 'created' : 'added')
            : entry.action === HistoryAction.REMOVED ? 'removed' : 'changed';
        switch (entry.recordType) {
            case HistoryRecordType.PROJECT:
                return `${verb} the project`;
            case HistoryRecordType.CONTRACT:
                return `${verb} the contract`;
            case HistoryRecordType.STAGE:
                return `${verb} stage`;
            default:
                return `${verb} task`;
        }
    }

    // A removed stage or task has no page to open, so none of its entries links to it
    recordRoute(entry: HistoryEntry): unknown[] | null {
        if (this.removedRecords().has(recordKey(entry))) {
            return null;
        }
        switch (entry.recordType) {
            case HistoryRecordType.STAGE:
                return ['/projects', this.projectId, 'stages', entry.recordId];
            case HistoryRecordType.TASK:
                return ['/projects', this.projectId, 'stages', entry.stageId, 'tasks', entry.recordId];
            default:
                return null;
        }
    }

    hasRecordName(entry: HistoryEntry): boolean {
        return entry.recordType === HistoryRecordType.STAGE || entry.recordType === HistoryRecordType.TASK;
    }

    isDate(change: HistoryChange): boolean {
        return DATE_FIELDS.includes(change.field!);
    }

    statusLabel(entry: HistoryEntry, status: string): string {
        return resolveLabel(status, this.statuses(entry.recordType!));
    }

    noteShown(entry: HistoryEntry): boolean {
        return this.shownNotes().has(this.entryKey(entry));
    }

    toggleNote(entry: HistoryEntry): void {
        const shownNotes = new Set(this.shownNotes());
        const key = this.entryKey(entry);
        if (!shownNotes.delete(key)) {
            shownNotes.add(key);
        }
        this.shownNotes.set(shownNotes);
    }

    private statuses(recordType: HistoryRecordType): ConfigurationEntry[] {
        const configuration = this.configurationStore.configuration;
        switch (recordType) {
            case HistoryRecordType.PROJECT:
                return configuration.projectStatuses();
            case HistoryRecordType.CONTRACT:
                return configuration.contractStatuses();
            case HistoryRecordType.STAGE:
                return configuration.stageStatuses();
            default:
                return configuration.taskStatuses();
        }
    }
}
