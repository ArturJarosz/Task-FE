import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {SelectModule} from "primeng/select";
import {SkeletonModule} from "primeng/skeleton";
import {Architect} from "../../generated/models/architect";
import {UserSummary} from "../../generated/models/user-summary";
import {EmptyStateComponent} from "../../shared";
import {architectName} from "../../project/project-filter/project-filter";
import {accountName} from "../account-name";

export interface AccountOption {
    id: number;
    username: string;
    // Empty when it would only repeat the username, which falls back to the email
    email: string;
    // Why the account can't be picked
    note: string | null;
    disabled: boolean;
}

// Links an architect with the account the person logs in with, replaces that account or removes the link
@Component({
    selector: 'link-account',
    templateUrl: './link-account.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, SelectModule, SkeletonModule, ReactiveFormsModule, EmptyStateComponent]
})
export class LinkAccountComponent implements OnChanges {
    // The dialog is open while an architect is set
    @Input()
    architect: Architect | null = null;
    // All architects, to tell which accounts are already taken; null until loaded
    @Input()
    architects: Architect[] | null = null;
    // Null until loaded
    @Input()
    users: UserSummary[] | null = null;
    @Input()
    loadFailed = false;
    @Input()
    saving = false;

    @Output()
    save = new EventEmitter<number>();
    @Output()
    unlink = new EventEmitter<void>();
    @Output()
    retry = new EventEmitter<void>();
    @Output()
    closed = new EventEmitter<void>();

    readonly account = new FormControl<number | null>(null, {validators: [Validators.required]});

    options: AccountOption[] = [];

    get visible(): boolean {
        return this.architect !== null;
    }

    get name(): string {
        return architectName(this.architect ?? undefined);
    }

    get isLinked(): boolean {
        return this.architect?.linkedUser != null;
    }

    get isLoading(): boolean {
        return !this.loadFailed && (this.users === null || this.architects === null);
    }

    get canSave(): boolean {
        return this.account.valid && this.account.value !== this.architect?.linkedUser?.id && !this.saving
            && !this.isLoading && !this.loadFailed;
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Only opening the dialog resets the field: list reloads keep what was picked
        if (changes['architect']) {
            this.account.reset(this.architect?.linkedUser?.id ?? null);
        }
        if (changes['users'] || changes['architects'] || changes['architect']) {
            this.options = this.buildOptions();
            this.dropUnavailableAccount();
        }
    }

    onSave(): void {
        if (this.canSave) {
            this.save.emit(this.account.value!);
        }
    }

    private buildOptions(): AccountOption[] {
        return (this.users ?? []).map(user => {
            let otherArchitect = (this.architects ?? []).find(other =>
                other.id !== this.architect?.id && other.linkedUser?.id === user.id);
            let username = accountName(user);
            let hasProfile = !!(user.username || user.email);
            let note = otherArchitect ? `Linked to ${architectName(otherArchitect)}`
                : hasProfile ? null : 'No name or email yet';
            return {
                id: user.id!,
                username: username,
                email: user.email && user.email !== username ? user.email : '',
                note: note,
                disabled: note !== null,
            };
        });
    }

    // Reloaded lists can show that the picked account was taken or removed in the meantime
    private dropUnavailableAccount(): void {
        let picked = this.account.value;
        if (!this.users || !this.architects || picked === null || picked === this.architect?.linkedUser?.id) {
            return;
        }
        if (!this.options.some(option => option.id === picked && !option.disabled)) {
            this.account.reset(null);
        }
    }
}
