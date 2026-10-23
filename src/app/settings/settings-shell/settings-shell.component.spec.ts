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
            {id: 3, name: 'Theme color', type: 'TEXT', value: '#465fff', defaultValue: '#465fff'}
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
            .flush([{id: 3, name: 'Theme color', type: 'TEXT', value: '#0f766e', defaultValue: '#465fff'}]);
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
});
