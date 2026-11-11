import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent} from "../../shared";
import {Role} from "../../generated/models/role";
import {permissionsSummary, usersText} from "../permissions";

// Compact table of roles: one short row each, edited through a pencil button and deleted through a trash button. The
// administrator role can't be changed, and a role given to anyone can't be deleted
@Component({
    selector: 'role-list',
    templateUrl: './role-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent]
})
export class RoleListComponent {
    @Input()
    roles: Role[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;
    // Number of permissions a role can give, null until known
    @Input()
    permissionsCount: number | null = null;
    // Id of the role being deleted
    @Input()
    deleting: number | null = null;

    @Output()
    edit = new EventEmitter<Role>();
    @Output()
    delete = new EventEmitter<Role>();
    @Output()
    retry = new EventEmitter<void>();

    readonly skeletonRows = [1, 2, 3];
    readonly getUsersText = usersText;

    permissionsText(role: Role): string {
        return permissionsSummary(role, this.permissionsCount);
    }

    editLabel(role: Role): string {
        return role.administrator ? 'The administrator role has every permission, so it can\'t be changed'
            : `Edit ${role.name}`;
    }

    canDelete(role: Role): boolean {
        return !role.administrator && !role.numberOfUsers;
    }

    deleteLabel(role: Role): string {
        if (role.administrator) {
            return 'The administrator role can\'t be deleted';
        }
        return role.numberOfUsers ? `Given to ${usersText(role.numberOfUsers)}, so it can't be deleted`
            : `Delete ${role.name}`;
    }
}
