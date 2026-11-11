import {PermissionAction} from "../generated/models/permission-action";
import {PermissionResource} from "../generated/models/permission-resource";
import {ResourcePermissions} from "../generated/models/resource-permissions";
import {Role} from "../generated/models/role";
import {NAMED_ENTRY_NAME_MAX_LENGTH} from "./named-entry";

// Roles are named like other configurable lists, with the same limit
export const ROLE_NAME_MAX_LENGTH = NAMED_ENTRY_NAME_MAX_LENGTH;

// Columns of the role dialog's permission table. Which actions a resource has comes from the backend
// (GET /permissions); this only names them
export const PERMISSION_ACTIONS: {action: PermissionAction, label: string}[] = [
    {action: PermissionAction.READ, label: 'Read'},
    {action: PermissionAction.CREATE, label: 'Create'},
    {action: PermissionAction.EDIT, label: 'Edit'},
    {action: PermissionAction.DELETE, label: 'Delete'},
];

export interface ResourceText {
    label: string;
}

// Every resource needs words here: a new backend resource fails to compile until it gets them
export const RESOURCE_TEXTS: Record<PermissionResource, ResourceText> = {
    [PermissionResource.PROJECT]: {label: 'Projects'},
    [PermissionResource.CONTRACT]: {label: 'Contracts'},
    [PermissionResource.TIME_ENTRY]: {label: 'Time entries'},
    [PermissionResource.CLIENT]: {label: 'Clients'},
    [PermissionResource.ARCHITECT]: {label: 'Architects'},
    [PermissionResource.CONTRACTOR]: {label: 'Contractors'},
    [PermissionResource.SUPPLIER]: {label: 'Suppliers'},
    [PermissionResource.CALENDAR]: {label: 'Calendar'},
    [PermissionResource.PROJECT_FINANCE]: {label: 'Project finances'},
    [PermissionResource.COMPANY_COST]: {label: 'Company costs'},
    [PermissionResource.FINANCIAL_REPORT]: {label: 'Financial report'},
    [PermissionResource.SETTINGS]: {label: 'Settings'},
    [PermissionResource.USER]: {label: 'Users'},
    [PermissionResource.ROLE]: {label: 'Roles'},
};

// One key per permission, to keep them in a Set
export function permissionKey(resource: PermissionResource | undefined, action: PermissionAction | undefined): string {
    return `${resource}:${action}`;
}

// Number of permissions a role can give, from the available ones
export function countPermissions(resources: ResourcePermissions[]): number {
    return resources.reduce((count, resource) => count + (resource.actions?.length ?? 0), 0);
}

// "All", "12 of 46" or "None"; just the count while the available permissions aren't known
export function permissionsSummary(role: Role, total: number | null): string {
    if (role.administrator) {
        return 'All';
    }
    let count = role.permissions?.length ?? 0;
    if (!count) {
        return 'None';
    }
    return total ? `${count} of ${total}` : `${count}`;
}

// "1 user", "3 users"
export function usersText(count: number | undefined): string {
    return `${count ?? 0} ${count === 1 ? 'user' : 'users'}`;
}
