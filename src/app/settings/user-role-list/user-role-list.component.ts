import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {UserSummary} from "../../generated/models/user-summary";
import {Role} from "../../generated/models/role";
import {accountName} from "../account-name";

// Compact table of everyone who has logged in, with their roles; a pencil button changes the roles
@Component({
    selector: 'user-role-list',
    templateUrl: './user-role-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent, NotSetComponent]
})
export class UserRoleListComponent {
    @Input()
    users: UserSummary[] = [];
    // To name the roles of each user
    @Input()
    roles: Role[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;

    @Output()
    editRoles = new EventEmitter<UserSummary>();
    @Output()
    retry = new EventEmitter<void>();

    readonly skeletonRows = [1, 2, 3];
    readonly getAccountName = accountName;

    // In the order of the role list (by name)
    roleNames(user: UserSummary): string {
        let roleIds = new Set(user.roleIds ?? []);
        return this.roles.filter(role => roleIds.has(role.id!)).map(role => role.name).join(', ');
    }

    editLabel(user: UserSummary): string {
        return `Edit roles of ${accountName(user)}`;
    }
}
