import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DatePipe} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";
import {SkeletonModule} from "primeng/skeleton";
import {ReleaseNote} from "../../../generated/models/release-note";
import {ReleaseNoteType} from "../../../generated/models/release-note-type";
import {EmptyStateComponent} from "../../empty-state/empty-state.component";
import {statusSeverity} from "../../status-severity";
import {WhatsNewMode} from "../state";

const TYPE_LABELS: Record<ReleaseNoteType, string> = {
    [ReleaseNoteType.NEW]: 'New',
    [ReleaseNoteType.IMPROVED]: 'Improved',
    [ReleaseNoteType.FIXED]: 'Fixed',
};

interface VersionGroup {
    version: string;
    // Notes reach production together with their version, so the newest one tells when it was released
    releasedOn: string | undefined;
    releaseNotes: ReleaseNote[];
}

// Lists changes of the application for its users: after login the ones since the last visit, from the user menu all
@Component({
    selector: 'whats-new-dialog',
    templateUrl: './whats-new-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, TagModule, SkeletonModule, DatePipe, EmptyStateComponent]
})
export class WhatsNewDialogComponent implements OnChanges {
    // The dialog is open while a mode is set
    @Input()
    mode: WhatsNewMode | null = null;
    @Input()
    releaseNotes: ReleaseNote[] = [];
    // Start of the period the notes cover, shown under the title
    @Input()
    since: string | null = null;
    @Input()
    loading = false;
    @Input()
    loadFailed = false;

    @Output()
    closed = new EventEmitter<void>();
    @Output()
    retry = new EventEmitter<void>();

    protected readonly statusSeverity = statusSeverity;

    versionGroups: VersionGroup[] = [];

    // Notes whose description is shown; every opening of the dialog starts with titles only
    private expandedNoteIds = new Set<number | undefined>();

    get visible(): boolean {
        return this.mode !== null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['mode']) {
            this.expandedNoteIds = new Set();
        }
        if (changes['releaseNotes']) {
            this.versionGroups = this.groupByVersion();
        }
    }

    isExpanded(releaseNote: ReleaseNote): boolean {
        return this.expandedNoteIds.has(releaseNote.id);
    }

    toggle(releaseNote: ReleaseNote): void {
        if (!this.expandedNoteIds.delete(releaseNote.id)) {
            this.expandedNoteIds.add(releaseNote.id);
        }
    }

    typeLabel(type: ReleaseNoteType | undefined): string {
        return type ? TYPE_LABELS[type] : '';
    }

    // Notes come newest first, so the versions stay newest first as well
    private groupByVersion(): VersionGroup[] {
        let groups = new Map<string, ReleaseNote[]>();
        for (let releaseNote of this.releaseNotes) {
            let version = releaseNote.applicationVersion ?? '';
            groups.set(version, [...(groups.get(version) ?? []), releaseNote]);
        }
        return [...groups].map(([version, releaseNotes]) =>
            ({version, releasedOn: releaseNotes[0].createdDateTime, releaseNotes}));
    }
}
