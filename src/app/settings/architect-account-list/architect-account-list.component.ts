import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {Architect} from "../../generated/models/architect";
import {architectName} from "../../project/project-filter/project-filter";
import {accountName} from "../account-name";

// Compact table of architects and the accounts they log in with; a pencil button links or changes the account
@Component({
    selector: 'architect-account-list',
    templateUrl: './architect-account-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent, NotSetComponent]
})
export class ArchitectAccountListComponent {
    @Input()
    architects: Architect[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;

    @Output()
    editAccount = new EventEmitter<Architect>();
    @Output()
    retry = new EventEmitter<void>();

    readonly skeletonRows = [1, 2, 3];
    readonly getName = architectName;
    readonly getAccountName = accountName;

    getEditLabel(architect: Architect): string {
        return `${architect.linkedUser ? 'Edit account of' : 'Link account for'} ${this.getName(architect)}`;
    }
}
