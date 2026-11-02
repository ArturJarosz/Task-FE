import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
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

// Lists changes of the application for its users: after login the ones since the last visit, from the user menu all
@Component({
    selector: 'whats-new-dialog',
    templateUrl: './whats-new-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, TagModule, SkeletonModule, DatePipe, EmptyStateComponent]
})
export class WhatsNewDialogComponent {
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

    get visible(): boolean {
        return this.mode !== null;
    }

    typeLabel(type: ReleaseNoteType | undefined): string {
        return type ? TYPE_LABELS[type] : '';
    }
}
