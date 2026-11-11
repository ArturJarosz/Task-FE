import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {CheckboxModule} from "primeng/checkbox";
import {SkeletonModule} from "primeng/skeleton";
import {EmptyStateComponent} from "../../shared";
import {Role} from "../../generated/models/role";
import {Permission} from "../../generated/models/permission";
import {PermissionAction} from "../../generated/models/permission-action";
import {ResourcePermissions} from "../../generated/models/resource-permissions";
import {PERMISSION_ACTIONS, permissionKey, RESOURCE_TEXTS, ROLE_NAME_MAX_LENGTH} from "../permissions";

// Creates a role (no id) or changes the name and permissions of one. The permission table has a row per resource and
// a column per action, with a checkbox where the backend offers that action for the resource
@Component({
    selector: 'edit-role',
    templateUrl: './edit-role.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, CheckboxModule, SkeletonModule, ReactiveFormsModule,
        FormsModule, EmptyStateComponent]
})
export class EditRoleComponent implements OnChanges {
    // The dialog is open while a role is set
    @Input()
    role: Role | null = null;
    // All roles, to tell about a name that is already used before saving
    @Input()
    roles: Role[] = [];
    // Null until loaded
    @Input()
    resources: ResourcePermissions[] | null = null;
    @Input()
    resourcesLoadFailed = false;
    @Input()
    saving = false;

    @Output()
    save = new EventEmitter<Role>();
    @Output()
    retry = new EventEmitter<void>();
    @Output()
    closed = new EventEmitter<void>();

    readonly actions = PERMISSION_ACTIONS;
    readonly resourceTexts = RESOURCE_TEXTS;
    readonly skeletonRows = [1, 2, 3, 4];
    readonly maxLength = ROLE_NAME_MAX_LENGTH;
    readonly name = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(ROLE_NAME_MAX_LENGTH)]
    });
    // Picked permissions by permissionKey()
    permissions = new Set<string>();

    get visible(): boolean {
        return this.role !== null;
    }

    get isNew(): boolean {
        return this.role?.id == null;
    }

    // Names are unique regardless of letter case, as on the backend
    get nameTaken(): boolean {
        let name = this.name.value.trim().toLocaleLowerCase('pl');
        return !!name && this.roles.some(other => other.id !== this.role?.id
            && other.name?.trim().toLocaleLowerCase('pl') === name);
    }

    get changed(): boolean {
        let saved = new Set(this.savedKeys());
        return this.name.value.trim() !== (this.role?.name ?? '')
            || saved.size !== this.permissions.size || [...saved].some(key => !this.permissions.has(key));
    }

    // Only a newly opened role resets the form: saving and list reloads keep what was typed
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['role']) {
            this.name.reset(this.role?.name ?? '');
            this.permissions = new Set(this.savedKeys());
        }
    }

    offers(resource: ResourcePermissions, action: PermissionAction): boolean {
        return !!resource.actions?.includes(action);
    }

    has(resource: ResourcePermissions, action: PermissionAction): boolean {
        return this.permissions.has(permissionKey(resource.resource, action));
    }

    checkboxLabel(resource: ResourcePermissions, actionLabel: string): string {
        return `${actionLabel} ${this.resourceTexts[resource.resource!].label.toLowerCase()}`;
    }

    // Creating, editing or deleting something needs reading it: those turn Read on, and turning Read off turns the
    // row off. The same goes for a resource that is part of another one (its requiredResource, as project finances
    // are of projects): any of its actions turns on Read of that one, and turning that Read off turns the part off
    // too. The backend refuses a role breaking these rules
    toggle(resource: ResourcePermissions, action: PermissionAction, checked: boolean): void {
        let permissions = new Set(this.permissions);
        if (checked) {
            permissions.add(permissionKey(resource.resource, action));
            if (this.offers(resource, PermissionAction.READ)) {
                permissions.add(permissionKey(resource.resource, PermissionAction.READ));
            }
            if (resource.requiredResource) {
                permissions.add(permissionKey(resource.requiredResource, PermissionAction.READ));
            }
        } else if (action === PermissionAction.READ) {
            (this.resources ?? [])
                .filter(other => other.resource === resource.resource
                    || other.requiredResource === resource.resource)
                .forEach(other => other.actions?.forEach(otherAction =>
                    permissions.delete(permissionKey(other.resource, otherAction))));
        } else {
            permissions.delete(permissionKey(resource.resource, action));
        }
        this.permissions = permissions;
    }

    onSave(): void {
        if (this.name.invalid || this.nameTaken) {
            this.name.markAsDirty();
            return;
        }
        if (!this.resources) {
            return;
        }
        // In the order of the available permissions, as the backend returns them
        let permissions: Permission[] = this.resources.flatMap(resource => (resource.actions ?? [])
            .filter(action => this.has(resource, action))
            .map(action => ({resource: resource.resource, action: action})));
        this.save.emit({id: this.role!.id, name: this.name.value.trim(), permissions: permissions});
    }

    onHide(): void {
        this.closed.emit();
    }

    private savedKeys(): string[] {
        return (this.role?.permissions ?? []).map(permission => permissionKey(permission.resource, permission.action));
    }
}
