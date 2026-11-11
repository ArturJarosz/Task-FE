import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SimpleChange} from '@angular/core';

import {EditRoleComponent} from './edit-role.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {PermissionAction} from '../../generated/models/permission-action';
import {PermissionResource} from '../../generated/models/permission-resource';
import {ResourcePermissions} from '../../generated/models/resource-permissions';

describe('EditRoleComponent', () => {
    let fixture: ComponentFixture<EditRoleComponent>;
    let component: EditRoleComponent;
    const {READ, CREATE, EDIT, DELETE} = PermissionAction;
    let projects: ResourcePermissions = {resource: PermissionResource.PROJECT, actions: [READ, CREATE, EDIT, DELETE]};
    let contracts: ResourcePermissions = {resource: PermissionResource.CONTRACT, actions: [READ, EDIT]};
    let clients: ResourcePermissions = {resource: PermissionResource.CLIENT, actions: [READ, CREATE, EDIT, DELETE]};
    let projectFinances: ResourcePermissions = {resource: PermissionResource.PROJECT_FINANCE,
        actions: [READ, CREATE, EDIT, DELETE], requiredResource: PermissionResource.PROJECT};

    beforeEach(async () => {
        await TestBed.configureTestingModule({providers: provideTestDependencies()}).compileComponents();
        fixture = TestBed.createComponent(EditRoleComponent);
        component = fixture.componentInstance;
        component.resources = [projects, contracts, clients];
        open({id: 101, name: 'Architect', permissions: [{resource: PermissionResource.CLIENT, action: READ}]});
    });

    function open(role: object | null): void {
        component.role = role;
        component.ngOnChanges({role: new SimpleChange(null, role, false)});
    }

    it('should turn read on with any other action and every action off with read', () => {
        component.toggle(projects, DELETE, true);
        expect(component.has(projects, READ)).toBeTrue();
        component.toggle(projects, EDIT, true);

        component.toggle(projects, READ, false);

        expect(projects.actions!.some(action => component.has(projects, action))).toBeFalse();
        expect(component.has(clients, READ)).toBeTrue();
    });

    it('should turn project read on with project finances and project finances off with project read', () => {
        component.resources = [projects, projectFinances, clients];
        component.toggle(projectFinances, EDIT, true);
        expect(component.has(projects, READ)).toBeTrue();
        expect(component.has(projectFinances, READ)).toBeTrue();

        component.toggle(projects, READ, false);

        expect(projectFinances.actions!.some(action => component.has(projectFinances, action))).toBeFalse();
        expect(component.has(clients, READ)).toBeTrue();
    });

    it('should keep project finances when only a project action other than read is turned off', () => {
        component.resources = [projects, projectFinances, clients];
        component.toggle(projects, EDIT, true);
        component.toggle(projectFinances, READ, true);

        component.toggle(projects, EDIT, false);

        expect(component.has(projects, READ)).toBeTrue();
        expect(component.has(projectFinances, READ)).toBeTrue();
    });

    it('should offer only the actions the backend gives for a resource', () => {
        expect(component.offers(contracts, EDIT)).toBeTrue();
        expect(component.offers(contracts, CREATE)).toBeFalse();

        fixture.detectChanges();
        let labels = Array.from(document.querySelectorAll('[aria-label="Permissions"] p-checkbox'))
            .map(checkbox => checkbox.getAttribute('ng-reflect-aria-label') ?? '');
        expect(document.querySelectorAll('[aria-label="Permissions"] [role="row"]').length).toBe(4);
        expect(document.querySelectorAll('[aria-label="Permissions"] p-checkbox').length).toBe(10);
        expect(labels).not.toContain('Create contracts');
    });

    it('should save the name and the permissions in the order of the available ones', () => {
        let saved: object | undefined;
        component.save.subscribe(role => saved = role);
        component.toggle(contracts, EDIT, true);
        component.toggle(projects, CREATE, true);
        component.name.setValue('  Designer ');

        component.onSave();

        expect(saved).toEqual({id: 101, name: 'Designer', permissions: [
            {resource: PermissionResource.PROJECT, action: READ},
            {resource: PermissionResource.PROJECT, action: CREATE},
            {resource: PermissionResource.CONTRACT, action: READ},
            {resource: PermissionResource.CONTRACT, action: EDIT},
            {resource: PermissionResource.CLIENT, action: READ}]});
    });

    it('should not save a name another role has, regardless of letter case', () => {
        let saved = false;
        component.save.subscribe(() => saved = true);
        component.roles = [{id: 101, name: 'Architect'}, {id: 102, name: 'Viewer'}];
        component.name.setValue('viewer');

        component.onSave();

        expect(component.nameTaken).toBeTrue();
        expect(saved).toBeFalse();
    });

    it('should tell when nothing changed', () => {
        expect(component.changed).toBeFalse();
        component.toggle(projects, READ, true);
        expect(component.changed).toBeTrue();
    });
});
