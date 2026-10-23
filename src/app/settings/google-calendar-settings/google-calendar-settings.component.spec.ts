import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GoogleCalendarSettingsComponent} from './google-calendar-settings.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {SystemParameter} from '../../generated/models/system-parameter';
import {GoogleCalendarConnectionStatus} from '../../generated/models/google-calendar-connection-status';
import {GoogleCalendarParameters} from '../google-calendar-parameters';
import {MessageService} from 'primeng/api';

const SERVICE_ACCOUNT_KEY = JSON.stringify({
    type: 'service_account',
    client_email: 'task@project.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n'
});

function prepareParameters(sync: boolean, keySaved: boolean): GoogleCalendarParameters {
    return {
        credentials: {id: 4, name: 'Google calendar credentials', type: 'SECRET', valueSet: keySaved},
        calendarName: {id: 5, name: 'Google calendar name', type: 'TEXT', value: 'Task', valueSet: true},
        applicationName: {id: 6, name: 'Google calendar application name', type: 'TEXT', value: 'Task', valueSet: true},
        sync: {id: 7, name: 'Google calendar sync', type: 'BOOLEAN', value: String(sync), valueSet: true},
    };
}

describe('GoogleCalendarSettingsComponent', () => {
    let fixture: ComponentFixture<GoogleCalendarSettingsComponent>;
    let component: GoogleCalendarSettingsComponent;
    let saved: SystemParameter[] | undefined;

    function setParameters(parameters: GoogleCalendarParameters): void {
        fixture.componentRef.setInput('parameters', parameters);
        fixture.detectChanges();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GoogleCalendarSettingsComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(GoogleCalendarSettingsComponent);
        component = fixture.componentInstance;
        saved = undefined;
        component.save.subscribe(parameters => saved = parameters);
    });

    it('should not let sync be turned on without a key', () => {
        setParameters(prepareParameters(false, false));

        component.form.controls.enabled.setValue(true);
        component.form.markAsDirty();
        fixture.detectChanges();

        expect(component.canSave).toBeFalse();
        expect(fixture.nativeElement.textContent).toContain('Add a service account key to turn sync on');
    });

    it('should reject text that is not a service account key', () => {
        setParameters(prepareParameters(false, false));

        component.form.controls.credentials.setValue('{"type": "authorized_user"}');
        component.form.markAsDirty();
        fixture.detectChanges();

        expect(component.canSave).toBeFalse();
        expect(fixture.nativeElement.textContent).toContain("This isn't a service account key");
    });

    it('should save a pasted key before turning sync on', () => {
        setParameters(prepareParameters(false, false));

        component.form.controls.enabled.setValue(true);
        component.form.controls.credentials.setValue(SERVICE_ACCOUNT_KEY);
        component.form.markAsDirty();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Key for task@project.iam.gserviceaccount.com');
        component.onSave();
        expect(saved?.map(parameter => [parameter.name, parameter.value])).toEqual([
            ['Google calendar credentials', SERVICE_ACCOUNT_KEY],
            ['Google calendar sync', 'true'],
        ]);
    });

    it('should save only the changed parameters and keep the saved key', () => {
        setParameters(prepareParameters(true, true));
        fixture.componentRef.setInput('connection', {status: GoogleCalendarConnectionStatus.CONNECTED,
            serviceAccountEmail: 'task@project.iam.gserviceaccount.com'});
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#calendarCredentials')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Saved for task@project.iam.gserviceaccount.com');

        component.form.controls.calendarName.setValue('Office');
        component.form.markAsDirty();
        component.onSave();

        expect(saved).toEqual([{...prepareParameters(true, true).calendarName!, value: 'Office'}]);
    });

    it('should warn when a new key is for another service account', () => {
        setParameters(prepareParameters(true, true));
        fixture.componentRef.setInput('connection', {status: GoogleCalendarConnectionStatus.CONNECTED,
            serviceAccountEmail: 'old@project.iam.gserviceaccount.com'});

        component.onReplaceKey();
        component.form.controls.credentials.setValue(SERVICE_ACCOUNT_KEY);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('another account');
    });

    it('should keep what was typed when saving fails before anything is stored', () => {
        setParameters(prepareParameters(false, true));
        component.form.controls.calendarName.setValue('Office');
        component.form.markAsDirty();

        fixture.componentRef.setInput('saving', true);
        fixture.detectChanges();
        fixture.componentRef.setInput('saving', false);
        fixture.detectChanges();

        expect(component.form.controls.calendarName.value).toBe('Office');
    });

    it('should keep the fields that were not stored when a save stops at an error', () => {
        let parameters = prepareParameters(false, true);
        setParameters(parameters);
        component.form.controls.calendarName.setValue('Office');
        component.form.controls.calendarName.markAsDirty();
        component.form.controls.enabled.setValue(true);
        component.form.controls.enabled.markAsDirty();

        fixture.componentRef.setInput('saving', true);
        fixture.detectChanges();
        // The calendar name is stored, then saving the sync fails
        fixture.componentRef.setInput('parameters', {...parameters, calendarName: {...parameters.calendarName!, value: 'Office'}});
        fixture.detectChanges();
        fixture.componentRef.setInput('saving', false);
        fixture.detectChanges();

        expect(component.form.controls.calendarName.value).toBe('Office');
        expect(component.form.controls.calendarName.dirty).toBeFalse();
        expect(component.form.controls.enabled.value).toBeTrue();
        expect(component.canSave).toBeTrue();
        component.onSave();
        expect(saved?.map(parameter => [parameter.name, parameter.value])).toEqual([['Google calendar sync', 'true']]);
    });

    it('should close the key field again with Cancel after Replace key', () => {
        setParameters(prepareParameters(true, true));
        let button = (label: string) => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
            .find(element => element.textContent?.includes(label));

        button('Replace key')!.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#calendarCredentials')).not.toBeNull();

        button('Cancel')!.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('#calendarCredentials')).toBeNull();
    });

    it('should say so instead of saving nothing when a parameter is missing on the server', () => {
        let toast = spyOn(TestBed.inject(MessageService), 'add');
        setParameters({...prepareParameters(false, true), sync: undefined});

        component.form.controls.enabled.setValue(true);
        component.form.markAsDirty();
        component.onSave();

        expect(saved).toBeUndefined();
        expect(toast).toHaveBeenCalledWith(jasmine.objectContaining({summary: 'Google Calendar settings are missing on the server'}));
    });

    it('should explain why Check connection is disabled while there are unsaved changes', () => {
        setParameters(prepareParameters(true, true));
        component.form.controls.calendarName.setValue('Office');
        component.form.markAsDirty();
        fixture.detectChanges();

        let check = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
            .find(button => button.textContent?.includes('Check connection'))!;
        expect(check.disabled).toBeTrue();
        let wrapper = check.closest('span.inline-flex')!;
        wrapper.dispatchEvent(new Event('mouseenter'));
        fixture.detectChanges();

        expect(document.body.querySelector('.p-tooltip')?.textContent).toContain('Save your changes first');
        wrapper.dispatchEvent(new Event('mouseleave'));
    });

    it('should show the connection problem reported by Google', () => {
        setParameters(prepareParameters(true, true));
        fixture.componentRef.setInput('connection', {status: GoogleCalendarConnectionStatus.PERMISSION_DENIED,
            message: 'Google Calendar API has not been used in project 123'});
        fixture.detectChanges();

        let text = fixture.nativeElement.textContent;
        expect(text).toContain('No access');
        expect(text).toContain('Google Calendar API has not been used in project 123');
    });

    it('should explain how to get a key when hovering the help icon', () => {
        setParameters(prepareParameters(false, false));

        let helpButton = fixture.nativeElement.querySelector('[aria-label="How to get a service account key"]');
        expect(helpButton).not.toBeNull();
        helpButton.closest('p-button').dispatchEvent(new Event('mouseenter'));
        fixture.detectChanges();

        let tooltip = document.body.querySelector('.p-tooltip');
        expect(tooltip?.textContent).toContain('Google Calendar API');
        expect(tooltip?.querySelector('a')?.getAttribute('href')).toBe('https://console.cloud.google.com/');
        helpButton.closest('p-button').dispatchEvent(new Event('mouseleave'));
    });
});
