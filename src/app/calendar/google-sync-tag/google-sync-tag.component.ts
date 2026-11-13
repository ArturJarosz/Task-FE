import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {TagModule} from "primeng/tag";
import {TooltipModule} from "primeng/tooltip";
import {statusSeverity} from "../../shared/status-severity";
import {GOOGLE_SYNC_ISSUES, GoogleSyncIssue, GoogleSyncIssueText} from "../model/calendar.model";

let nextId = 0;

// Next to the title of a card with events while they don't reach Google Calendar. It opens Settings › Google Calendar,
// or asks to check the connection again when the settings can't fix it; what the issue means is in the tooltip
@Component({
    selector: 'google-sync-tag',
    templateUrl: './google-sync-tag.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgTemplateOutlet, RouterLink, TagModule, TooltipModule]
})
export class GoogleSyncTagComponent {
    @Input({required: true})
    issue!: GoogleSyncIssue;
    // A check runs; the tag keeps the last answer with a spinner until the new one comes
    @Input()
    checking = false;

    @Output()
    recheck = new EventEmitter<void>();

    readonly hintId = `google-sync-hint-${nextId++}`;

    get text(): GoogleSyncIssueText {
        return GOOGLE_SYNC_ISSUES[this.issue];
    }

    get severity() {
        return statusSeverity(this.issue);
    }

    onRecheck(): void {
        if (!this.checking) {
            this.recheck.emit();
        }
    }
}
