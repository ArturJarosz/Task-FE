import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {MultiSelectModule} from "primeng/multiselect";
import {UserSummary} from "../../generated/models/user-summary";
import {Role} from "../../generated/models/role";
import {accountName} from "../account-name";

// Replaces the roles of one user
@Component({
    selector: 'edit-user-roles',
    templateUrl: './edit-user-roles.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, MultiSelectModule, ReactiveFormsModule]
})
export class EditUserRolesComponent implements OnChanges {
    // The dialog is open while a user is set
    @Input()
    user: UserSummary | null = null;
    @Input()
    roles: Role[] = [];
    @Input()
    saving = false;

    @Output()
    save = new EventEmitter<number[]>();
    @Output()
    closed = new EventEmitter<void>();

    readonly roleIds = new FormControl<number[]>([], {nonNullable: true});

    get visible(): boolean {
        return this.user !== null;
    }

    get name(): string {
        return this.user ? accountName(this.user) : '';
    }

    get changed(): boolean {
        let saved = new Set(this.user?.roleIds ?? []);
        let picked = this.roleIds.value;
        return saved.size !== picked.length || picked.some(roleId => !saved.has(roleId));
    }

    // Only opening the dialog resets the field: list reloads keep what was picked
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['user']) {
            this.roleIds.reset([...(this.user?.roleIds ?? [])]);
        }
    }

    onSave(): void {
        this.save.emit(this.roleIds.value);
    }
}
