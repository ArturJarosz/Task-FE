import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, LOCALE_ID, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DatePipe} from "@angular/common";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {Menu, MenuModule} from "primeng/menu";
import {SkeletonModule} from "primeng/skeleton";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {Architect} from "../../generated/models/architect";
import {TimeEntry} from "../../generated/models/time-entry";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {DurationPipe, formatDuration} from "../../shared/duration/duration.pipe";

// "Time entries" dialog on the task page: every entry of the task, latest first, with Edit and Delete in a row menu
@Component({
    selector: 'time-entries-dialog',
    templateUrl: './time-entries-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, DialogModule, MenuModule, SkeletonModule, TableModule, TooltipModule, EmptyStateComponent,
        NotSetComponent, DatePipe, DurationPipe]
})
export class TimeEntriesDialogComponent implements OnChanges {
    @Input()
    visible: boolean = false;
    @Input()
    taskName: string = '';
    @Input()
    timeEntries: TimeEntry[] = [];
    @Input()
    loading: boolean = false;
    @Input()
    loadFailed: boolean = false;
    @Input()
    architects: Architect[] | null = [];

    @Output()
    editEntry = new EventEmitter<TimeEntry>();
    @Output()
    deleteEntry = new EventEmitter<TimeEntry>();
    @Output()
    reload = new EventEmitter<void>();
    @Output()
    closed = new EventEmitter<void>();

    rowMenuItems: MenuItem[] = [];
    private architectNames = new Map<number, string>();
    private readonly locale = inject(LOCALE_ID);

    // The task and its total, e.g. "Floor plan · 11 h 30 min in 3 entries"
    get subtitle(): string {
        const minutes = this.timeEntries.reduce((sum, timeEntry) => sum + (timeEntry.durationMinutes ?? 0), 0);
        const count = this.timeEntries.length === 1 ? '1 entry' : `${this.timeEntries.length} entries`;
        const total = `${formatDuration(minutes, this.locale)} in ${count}`;
        return this.taskName ? `${this.taskName} · ${total}` : total;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['architects']) {
            this.architectNames = new Map((this.architects ?? []).map(architect =>
                [architect.id!, `${architect.firstName} ${architect.lastName}`]));
        }
    }

    getArchitectName(architectId: number | undefined): string {
        return architectId != null ? this.architectNames.get(architectId) ?? '' : '';
    }

    openRowMenu($event: MouseEvent, timeEntry: TimeEntry, menu: Menu): void {
        $event.stopPropagation();
        this.rowMenuItems = [
            {label: 'Edit', icon: 'pi pi-pencil', command: () => this.editEntry.emit(timeEntry)},
            {label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteEntry.emit(timeEntry)},
        ];
        menu.toggle($event);
    }
}
