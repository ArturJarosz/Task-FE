import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent} from "../../shared";
import {NamedEntry, NamedEntryTexts, usageText} from "../named-entry";
import {capitalize} from "../../shared/utils/label-utils";

// Compact table of named entries (such as project types): one short row each, renamed through a pencil button and
// deleted through a trash button, which is disabled while anything uses the entry
@Component({
    selector: 'named-entry-list',
    templateUrl: './named-entry-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent]
})
export class NamedEntryListComponent {
    @Input({required: true})
    texts!: NamedEntryTexts;
    @Input()
    entries: NamedEntry[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;
    // Id of the entry being deleted
    @Input()
    deleting: number | null = null;

    @Output()
    add = new EventEmitter<void>();
    @Output()
    rename = new EventEmitter<NamedEntry>();
    @Output()
    delete = new EventEmitter<NamedEntry>();
    @Output()
    retry = new EventEmitter<void>();

    readonly skeletonRows = [1, 2, 3];

    // Header of the usage column, such as "Projects"
    get usageHeader(): string {
        return capitalize(this.texts.usagePlural);
    }

    isUsed(entry: NamedEntry): boolean {
        return (entry.usageCount ?? 0) > 0;
    }

    usageText(entry: NamedEntry): string {
        return usageText(entry, this.texts);
    }

    deleteTooltip(entry: NamedEntry): string {
        return this.isUsed(entry)
            ? `Used by ${this.usageText(entry)}, so it can't be deleted`
            : `Delete ${entry.name}`;
    }
}
