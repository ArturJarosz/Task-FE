import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';

import {SettingsShellComponent} from './settings-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

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
        expect(text).toContain('Vat tax');
        expect(text).toContain('0,23');
    });

    it('should leave the theme color out of the system parameter list', () => {
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([
            {id: 1, name: 'Vat tax', type: 'DECIMAL_NUMBER', value: '0.23', defaultValue: '0.23'},
            {id: 3, name: 'Theme color', type: 'TEXT', value: '#415cc8', defaultValue: '#415cc8'}
        ]);
        harness.detectChanges();

        let text = harness.routeNativeElement!.textContent;
        expect(text).toContain('Vat tax');
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
        expect(names).toEqual(['Vat tax']);
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
});
