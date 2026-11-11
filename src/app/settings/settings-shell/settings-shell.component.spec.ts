import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';

import {SettingsShellComponent} from './settings-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {PermissionAction} from '../../generated/models/permission-action';
import {PermissionResource} from '../../generated/models/permission-resource';

describe('SettingsShellComponent', () => {
    let harness: RouterTestingHarness;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                ...provideTestDependencies(),
                provideRouter([{path: 'settings/:section', component: SettingsShellComponent}])
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/settings/system-parameters', SettingsShellComponent);
    });

    it('should list the sections and mark the open one', () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        harness.detectChanges();

        let active = harness.routeNativeElement!.querySelector('nav .app-nav-item.active');
        expect(active?.textContent).toContain('System parameters');
    });

    it('should show the loaded system parameters', () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters'))
            .flush([{id: 1, name: 'Vat tax', type: 'DECIMAL_NUMBER', value: '0.23', defaultValue: '0.23'}]);
        harness.detectChanges();

        let text = harness.routeNativeElement!.textContent;
        expect(text).toContain('VAT rate');
        expect(text).toContain('23%');
    });

    it('should leave the theme color out of the system parameter list', () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([
            {id: 1, name: 'Vat tax', type: 'DECIMAL_NUMBER', value: '0.23', defaultValue: '0.23'},
            {id: 3, name: 'Theme color', type: 'TEXT', value: '#415cc8', defaultValue: '#415cc8'}
        ]);
        harness.detectChanges();

        let text = harness.routeNativeElement!.textContent;
        expect(text).toContain('VAT rate');
        expect(text).not.toContain('Theme color');
    });

    it('should show the appearance section with the brand color', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/appearance', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters'))
            .flush([{id: 3, name: 'Theme color', type: 'TEXT', value: '#0f766e', defaultValue: '#415cc8'}]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Appearance');
        expect(element.textContent).toContain('Dark theme');
        expect((element.querySelector('#brandColor') as HTMLInputElement).value).toBe('#0f766e');
    });

    it('should show an error state when loading fails', () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters'))
            .flush('', {status: 500, statusText: 'Server error'});
        harness.detectChanges();

        expect(harness.routeNativeElement!.textContent).toContain("Couldn't load system parameters");
    });

    it('should leave the Google Calendar parameters out of the system parameter list', () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([
            {id: 1, name: 'Vat tax', type: 'DECIMAL_NUMBER', value: '0.23', defaultValue: '0.23'},
            {id: 4, name: 'Google calendar credentials', type: 'SECRET', valueSet: false},
            {id: 7, name: 'Google calendar sync', type: 'BOOLEAN', value: 'false'}
        ]);
        harness.detectChanges();

        let rows = harness.routeNativeElement!.querySelectorAll('[aria-label="System parameters"] [role="row"]');
        let names = Array.from(rows).map(row => row.querySelector('[role="cell"]')?.textContent?.trim()).filter(name => name);
        expect(names).toEqual(['VAT rate']);
    });

    it('should list project types and block deleting a type used by projects', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/project-types', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/project-types')).flush([
            {id: 100, name: 'Concept', numberOfProjects: 0},
            {id: 101, name: 'Interior house', numberOfProjects: 3}
        ]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Project types');
        let rows = Array.from(element.querySelectorAll('[aria-label="Project types"] [role="row"]')).slice(1);
        expect(rows.map(row => row.querySelector('[role="cell"]')?.textContent?.trim())).toEqual(['Concept', 'Interior house']);
        expect(rows[1].textContent).toContain('3 projects');
        let deleteButton = (row: Element) => row.querySelector('p-button[icon="pi pi-trash"] button') as HTMLButtonElement;
        expect(deleteButton(rows[0]).disabled).toBeFalse();
        expect(deleteButton(rows[1]).disabled).toBeTrue();
    });

    it('should list contractor categories and block deleting a category used by contractors', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/contractor-categories', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/contractor-categories')).flush([
            {id: 100, name: 'Electrician', numberOfContractors: 1},
            {id: 101, name: 'Roofer', numberOfContractors: 0}
        ]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Contractor categories');
        expect(element.textContent).toContain('New contractor category');
        let rows = Array.from(element.querySelectorAll('[aria-label="Contractor categories"] [role="row"]'));
        expect(rows[0].textContent).toContain('Contractors');
        expect(rows[1].textContent).toContain('1 contractor');
        let deleteButton = (row: Element) => row.querySelector('p-button[icon="pi pi-trash"] button') as HTMLButtonElement;
        expect(deleteButton(rows[1]).disabled).toBeTrue();
        expect(deleteButton(rows[2]).disabled).toBeFalse();
    });

    it('should offer to add the first supplier category when there are none', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/supplier-categories', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/supplier-categories')).flush([]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Supplier categories');
        expect(element.textContent).toContain('No supplier categories yet');
        expect(element.textContent).toContain('New supplier category');
    });

    it('should list cost categories and block deleting a category used by costs', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/cost-categories', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/cost-categories')).flush([
            {id: 100, name: 'Fuel', numberOfCosts: 3},
            {id: 101, name: 'Parking', numberOfCosts: 0}
        ]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Cost categories');
        expect(element.textContent).toContain('New cost category');
        let rows = Array.from(element.querySelectorAll('[aria-label="Cost categories"] [role="row"]'));
        expect(rows[0].textContent).toContain('Costs');
        expect(rows[1].textContent).toContain('3 costs');
        let deleteButton = (row: Element) => row.querySelector('p-button[icon="pi pi-trash"] button') as HTMLButtonElement;
        expect(deleteButton(rows[1]).disabled).toBeTrue();
        expect(deleteButton(rows[2]).disabled).toBeFalse();
    });

    it('should list stage types and block deleting a type used by stages', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/stage-types', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/stage-types')).flush([
            {id: 100, name: 'Visualisations', numberOfStages: 3},
            {id: 101, name: 'Functional layout', numberOfStages: 0}
        ]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Stage types');
        expect(element.textContent).toContain('New stage type');
        let rows = Array.from(element.querySelectorAll('[aria-label="Stage types"] [role="row"]'));
        expect(rows[0].textContent).toContain('Stages');
        expect(rows[1].textContent).toContain('3 stages');
        let deleteButton = (row: Element) => row.querySelector('p-button[icon="pi pi-trash"] button') as HTMLButtonElement;
        expect(deleteButton(rows[1]).disabled).toBeTrue();
        expect(deleteButton(rows[2]).disabled).toBeFalse();
    });

    it('should list task types and block deleting a type used by tasks', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/task-types', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/task-types')).flush([
            {id: 100, name: 'Render', numberOfTasks: 3},
            {id: 101, name: 'Shopping', numberOfTasks: 0}
        ]);
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Task types');
        expect(element.textContent).toContain('New task type');
        let rows = Array.from(element.querySelectorAll('[aria-label="Task types"] [role="row"]'));
        expect(rows[0].textContent).toContain('Tasks');
        expect(rows[1].textContent).toContain('3 tasks');
        let deleteButton = (row: Element) => row.querySelector('p-button[icon="pi pi-trash"] button') as HTMLButtonElement;
        expect(deleteButton(rows[1]).disabled).toBeTrue();
        expect(deleteButton(rows[2]).disabled).toBeFalse();
    });

    it('should show the Google Calendar section with its connection status', async () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
        await harness.navigateByUrl('/settings/google-calendar', SettingsShellComponent);
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([
            {id: 4, name: 'Google calendar credentials', type: 'SECRET', valueSet: true},
            {id: 5, name: 'Google calendar name', type: 'TEXT', value: 'Task', valueSet: true},
            {id: 6, name: 'Google calendar application name', type: 'TEXT', value: 'Task', valueSet: true},
            {id: 7, name: 'Google calendar sync', type: 'BOOLEAN', value: 'true', valueSet: true}
        ]);
        httpTesting.expectOne(request => request.url.endsWith('/calendars/connection-status')).flush({
            status: 'CONNECTED', serviceAccountEmail: 'task@project.iam.gserviceaccount.com',
            checkedDateTime: '2026-10-23T21:40:00'
        });
        harness.detectChanges();

        let element = harness.routeNativeElement!;
        expect(element.querySelector('nav .app-nav-item.active')?.textContent).toContain('Google Calendar');
        expect(element.textContent).toContain('Connected');
        expect(element.textContent).toContain('Saved for task@project.iam.gserviceaccount.com');
        expect((element.querySelector('#calendarName') as HTMLInputElement).value).toBe('Task');
    });

    describe('roles', () => {
        beforeEach(async () => {
            httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
            await harness.navigateByUrl('/settings/roles', SettingsShellComponent);
            httpTesting.expectOne(request => request.url.endsWith('/permissions')).flush([
                {resource: 'PROJECT', actions: ['READ', 'CREATE', 'EDIT', 'DELETE']},
                {resource: 'CONTRACT', actions: ['READ', 'EDIT']}
            ]);
        });

        it('should list roles and block changing the administrator role and deleting a role given to users', () => {
            httpTesting.expectOne(request => request.url.endsWith('/roles')).flush([
                {id: 100, name: 'Administrator', administrator: true, permissions: [], numberOfUsers: 1},
                {id: 101, name: 'Architect', numberOfUsers: 2,
                    permissions: [{resource: 'PROJECT', action: 'READ'}, {resource: 'PROJECT', action: 'EDIT'}]},
                {id: 102, name: 'Viewer', permissions: [], numberOfUsers: 0}
            ]);
            harness.detectChanges();

            let rows = Array.from(harness.routeNativeElement!.querySelectorAll('[aria-label="Roles"] [role="row"]')).slice(1);
            expect(rows.map(row => row.querySelector('[role="cell"]')?.textContent?.trim()))
                .toEqual(['Administrator', 'Architect', 'Viewer']);
            expect(rows[0].textContent).toContain('All');
            expect(rows[1].textContent).toContain('2 of 6');
            expect(rows[1].textContent).toContain('2 users');
            let button = (row: Element, icon: string) =>
                row.querySelector(`p-button[icon="pi pi-${icon}"] button`) as HTMLButtonElement;
            expect(button(rows[0], 'pencil').disabled).toBeTrue();
            expect(button(rows[0], 'trash').disabled).toBeTrue();
            expect(button(rows[1], 'pencil').disabled).toBeFalse();
            expect(button(rows[1], 'trash').disabled).toBeTrue();
            expect(button(rows[2], 'trash').disabled).toBeFalse();
        });

        it('should create a role and reload the list', () => {
            httpTesting.expectOne(request => request.url.endsWith('/roles')).flush([]);
            let shell = harness.routeDebugElement!.componentInstance as SettingsShellComponent;

            shell.onAddRole();
            shell.onSaveRole({name: 'Accountant', permissions: [{resource: PermissionResource.PROJECT_FINANCE, action: PermissionAction.READ}]});
            let request = httpTesting.expectOne(request => request.url.endsWith('/roles') && request.method === 'POST');
            expect(request.request.body).toEqual({name: 'Accountant', permissions: [{resource: PermissionResource.PROJECT_FINANCE, action: PermissionAction.READ}]});
            request.flush({id: 103, name: 'Accountant', permissions: [{resource: PermissionResource.PROJECT_FINANCE, action: PermissionAction.READ}], numberOfUsers: 0});

            expect(shell.$editedRole()).toBeNull();
            httpTesting.expectOne(request => request.url.endsWith('/roles') && request.method === 'GET').flush([]);
        });

        it('should keep the dialog open when saving a role fails', () => {
            httpTesting.expectOne(request => request.url.endsWith('/roles')).flush([]);
            let shell = harness.routeDebugElement!.componentInstance as SettingsShellComponent;
            let role = {id: 101, name: 'Architect', permissions: []};

            shell.$editedRole.set(role);
            shell.onSaveRole({...role, name: 'Designer'});
            httpTesting.expectOne(request => request.url.endsWith('/roles/101'))
                .flush({message: 'Role with name Designer already exists.'}, {status: 400, statusText: 'Bad Request'});

            expect(shell.$editedRole()).toEqual(role);
        });
    });

    describe('users', () => {
        beforeEach(async () => {
            httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
            await harness.navigateByUrl('/settings/users', SettingsShellComponent);
        });

        it('should list users with the names of their roles', () => {
            httpTesting.expectOne(request => request.url.endsWith('/roles')).flush([
                {id: 100, name: 'Administrator', administrator: true},
                {id: 101, name: 'Architect'}
            ]);
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([
                {id: 5, username: 'Maria Kowalska', email: 'maria@example.com', roleIds: [101, 100]},
                {id: 6, username: 'Jan Nowak', roleIds: []}
            ]);
            harness.detectChanges();

            let rows = Array.from(harness.routeNativeElement!.querySelectorAll('[aria-label="Users"] [role="row"]')).slice(1);
            expect(rows[0].textContent).toContain('Maria Kowalska');
            expect(rows[0].textContent).toContain('Administrator, Architect');
            expect(rows[1].textContent).toContain('Not set');
        });

        it('should save the picked roles and reload the roles', () => {
            httpTesting.expectOne(request => request.url.endsWith('/roles')).flush([{id: 101, name: 'Architect'}]);
            let user = {id: 6, username: 'Jan Nowak', roleIds: []};
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([user]);
            let shell = harness.routeDebugElement!.componentInstance as SettingsShellComponent;

            shell.$editedUser.set(user);
            shell.onSaveUserRoles([101]);
            let request = httpTesting.expectOne(request => request.url.endsWith('/users/6/roles'));
            expect(request.request.method).toBe('PUT');
            expect(request.request.body).toEqual({roleIds: [101]});
            request.flush({...user, roleIds: [101]});
            harness.detectChanges();

            expect(shell.$editedUser()).toBeNull();
            httpTesting.expectOne(request => request.url.endsWith('/roles')).flush([{id: 101, name: 'Architect'}]);
            harness.detectChanges();
            expect(harness.routeNativeElement!.querySelector('[aria-label="Users"]')?.textContent).toContain('Architect');
        });
    });

    describe('architect account dialog', () => {
        it('should leave another architect\'s dialog open when an earlier save finishes', async () => {
            httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
            await harness.navigateByUrl('/settings/architect-accounts', SettingsShellComponent);
            let first = {id: 1, firstName: 'Anna', lastName: 'Nowak'};
            let second = {id: 2, firstName: 'Piotr', lastName: 'Zielinski'};
            httpTesting.expectOne(request => request.url.endsWith('/architects')).flush([first, second]);
            let shell = harness.routeDebugElement!.componentInstance as SettingsShellComponent;

            shell.onEditArchitectAccount(first);
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([]);
            shell.onLinkAccount(5);
            shell.$editedArchitect.set(null);
            shell.onEditArchitectAccount(second);
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([]);
            httpTesting.expectOne(request => request.url.endsWith('/architects/1/user')).flush(first);

            expect(shell.$editedArchitect()).toEqual(second);
        });
    });

    describe('architect accounts', () => {
        beforeEach(async () => {
            httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([]);
            await harness.navigateByUrl('/settings/architect-accounts', SettingsShellComponent);
        });

        it('should list architects with their accounts', () => {
            httpTesting.expectOne(request => request.url.endsWith('/architects')).flush([
                {id: 1, firstName: 'Anna', lastName: 'Nowak', linkedUser: {id: 5, username: 'Maria Kowalska'}}
            ]);
            harness.detectChanges();

            let text = harness.routeNativeElement!.textContent;
            expect(text).toContain('Anna Nowak');
            expect(text).toContain('Maria Kowalska');
        });

        it('should load the accounts when opening the dialog and link the picked one', () => {
            let architect = {id: 1, firstName: 'Anna', lastName: 'Nowak'};
            httpTesting.expectOne(request => request.url.endsWith('/architects')).flush([architect]);
            harness.detectChanges();

            let shell = harness.routeDebugElement!.componentInstance as SettingsShellComponent;
            shell.onEditArchitectAccount(architect);
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([{id: 5, username: 'Maria Kowalska'}]);
            httpTesting.expectNone(request => request.url.endsWith('/architects'));
            harness.detectChanges();
            expect(shell.$linkAccountArchitects()).toEqual([architect]);

            shell.onLinkAccount(5);
            let request = httpTesting.expectOne(request => request.url.endsWith('/architects/1/user'));
            expect(request.request.method).toBe('PUT');
            expect(request.request.body).toEqual({userId: 5});
            request.flush({...architect, linkedUser: {id: 5, username: 'Maria Kowalska'}});
            harness.detectChanges();

            expect(shell.$editedArchitect()).toBeNull();
            expect(harness.routeNativeElement!.textContent).toContain('Maria Kowalska');
        });

        it('should keep the dialog open and reload the lists when linking fails', () => {
            let architect = {id: 1, firstName: 'Anna', lastName: 'Nowak'};
            httpTesting.expectOne(request => request.url.endsWith('/architects')).flush([architect]);
            let shell = harness.routeDebugElement!.componentInstance as SettingsShellComponent;
            shell.onEditArchitectAccount(architect);
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([]);

            shell.onLinkAccount(5);
            httpTesting.expectOne(request => request.url.endsWith('/architects/1/user'))
                .flush({message: 'taken'}, {status: 400, statusText: 'Bad Request'});

            expect(shell.$editedArchitect()).toEqual(architect);
            httpTesting.expectOne(request => request.url.endsWith('/users')).flush([]);
            httpTesting.expectOne(request => request.url.endsWith('/architects')).flush([architect]);
        });
    });
});
