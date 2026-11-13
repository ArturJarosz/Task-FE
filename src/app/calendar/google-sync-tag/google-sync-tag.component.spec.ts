import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GoogleSyncTagComponent} from './google-sync-tag.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('GoogleSyncTagComponent', () => {
    let fixture: ComponentFixture<GoogleSyncTagComponent>;

    function show(issue: string): HTMLElement {
        fixture.componentRef.setInput('issue', issue);
        fixture.detectChanges();
        return fixture.nativeElement;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [GoogleSyncTagComponent], providers: provideTestDependencies()});
        fixture = TestBed.createComponent(GoogleSyncTagComponent);
    });

    it('should link an issue the settings can fix to Settings › Google Calendar', () => {
        const link = show('NOT_CONFIGURED').querySelector('a')!;

        expect(link.getAttribute('href')).toBe('/settings/google-calendar');
        expect(link.textContent).toContain('Google Calendar not set up');
        expect(document.getElementById(link.getAttribute('aria-describedby')!)!.textContent).toContain('Set up sync');
    });

    it('should ask to check again when Google could not be reached, but not while a check runs', () => {
        let rechecks = 0;
        fixture.componentInstance.recheck.subscribe(() => rechecks++);
        const button = show('CONNECTION_FAILED').querySelector('button')!;

        button.click();
        fixture.componentRef.setInput('checking', true);
        fixture.detectChanges();
        button.click();

        expect(button.textContent).toContain('Can\'t reach Google');
        expect(button.querySelector('.pi-spin')).not.toBeNull();
        expect(rechecks).toBe(1);
    });
});
