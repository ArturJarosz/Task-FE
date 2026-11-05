import {ComponentFixture, TestBed} from '@angular/core/testing';
import {addDays, startOfToday} from 'date-fns';

import {LogTimeDialogComponent, LogTimeForm} from './log-time-dialog.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {toTimeZoneString} from '../../shared/utils/date-utils';
import {TimeEntry} from '../../generated/models/time-entry';

const ARCHITECTS = [
    {id: 7, firstName: 'Anna', lastName: 'Nowak'},
    {id: 8, firstName: 'Piotr', lastName: 'Lis'},
];

describe('LogTimeDialogComponent', () => {
    let fixture: ComponentFixture<LogTimeDialogComponent>;
    let component: LogTimeDialogComponent;
    let saved: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LogTimeDialogComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(LogTimeDialogComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('architects', ARCHITECTS);
        fixture.componentRef.setInput('taskName', 'Floor plan');
        saved = jasmine.createSpy('save');
        component.save.subscribe(saved);
    });

    function open(timeEntry: TimeEntry): void {
        fixture.componentRef.setInput('timeEntry', timeEntry);
        fixture.detectChanges();
    }

    // As typed by the user: the field changes and loses focus
    function enter<K extends keyof LogTimeForm>(field: K, value: LogTimeForm[K]['value']): void {
        const control = component.form.controls[field];
        control.setValue(value as never);
        control.markAsDirty();
        control.markAsTouched();
        fixture.detectChanges();
    }

    // Typed into the field itself, as a key press updates the OnPush dialog
    function type(text: string): void {
        const input = document.getElementById('logTimeDuration') as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    function dialogText(): string {
        return document.body.textContent ?? '';
    }

    it('should log time for today by the task\'s architect by default', () => {
        open({architectId: 8});

        expect(component.form.controls.workDate.value).toEqual(startOfToday());
        expect(component.form.controls.architectId.value).toBe(8);
        expect(component.form.controls.duration.value).toBeNull();
        expect(component.canSave).toBeFalse();
        expect(dialogText()).toContain('Floor plan');
        expect(dialogText()).toContain('Like 2h30m or 45m. Just 2 means 2 h.');
    });

    it('should send the typed time as minutes', () => {
        open({architectId: 7});
        enter('duration', '2h30m');
        enter('note', '  Second variant ');

        component.onSave();

        expect(saved).toHaveBeenCalledOnceWith({
            id: undefined,
            workDate: toTimeZoneString(startOfToday()),
            architectId: 7,
            durationMinutes: 150,
            note: 'Second variant',
        });
    });

    it('should count a number without a unit as hours and leave out an empty note', () => {
        open({architectId: 7});
        enter('duration', '3');

        component.onSave();

        expect(saved).toHaveBeenCalledOnceWith(jasmine.objectContaining({durationMinutes: 180, note: undefined}));
    });

    it('should show how the typed time is read', () => {
        open({architectId: 7});
        type('1.5');

        expect(dialogText()).toContain('Saved as 1 h 30 min');

        type('45m');

        expect(dialogText()).toContain('Saved as 45 min');
        expect(dialogText()).not.toContain('Saved as 1 h 30 min');
    });

    it('should show an edited entry\'s time as typed and save it only once changed', () => {
        open({id: 5, workDate: '2026-01-15', architectId: 7, durationMinutes: 150, note: 'Second variant'});

        expect(component.isNew).toBeFalse();
        expect(component.form.controls.workDate.value).toEqual(new Date(2026, 0, 15));
        expect(component.form.controls.duration.value).toBe('2h30m');
        expect(component.canSave).toBeFalse();
        expect(dialogText()).toContain('Edit time entry');

        enter('duration', '150m');

        expect(component.canSave).withContext('the same time written differently').toBeFalse();

        enter('duration', '2h45m');
        component.onSave();

        expect(saved).toHaveBeenCalledOnceWith({
            id: 5, workDate: '2026-01-15', architectId: 7, durationMinutes: 165, note: 'Second variant'
        });
    });

    it('should not flag a half-typed time before the field is left', () => {
        open({architectId: 7});
        const duration = component.form.controls.duration;
        duration.setValue('2.');
        duration.markAsDirty();
        fixture.detectChanges();

        expect(component.durationError).toBeNull();
        expect(component.canSave).toBeFalse();

        duration.markAsTouched();
        fixture.detectChanges();

        expect(dialogText()).toContain('Enter the time like 2h30m, 2h or 45m');
    });

    describe('tells what to fix', () => {
        beforeEach(() => open({architectId: 7}));

        it('when the time can\'t be read', () => {
            enter('duration', '2 hours and a bit');

            expect(dialogText()).toContain('Enter the time like 2h30m, 2h or 45m');
            expect(component.canSave).toBeFalse();
        });

        it('when no time is entered', () => {
            enter('duration', '');

            expect(dialogText()).toContain('Enter the time spent, at least 1 minute');
            expect(component.canSave).toBeFalse();
        });

        it('when the time is zero', () => {
            enter('duration', '0h0m');

            expect(dialogText()).toContain('Enter the time spent, at least 1 minute');
            expect(component.canSave).toBeFalse();
        });

        it('when the time is longer than a day', () => {
            enter('duration', '24h1m');

            expect(dialogText()).toContain('The time spent can\'t be more than 24 hours');
            expect(component.canSave).toBeFalse();
        });

        it('when saving without a time', () => {
            component.onSave();
            fixture.detectChanges();

            expect(saved).not.toHaveBeenCalled();
            expect(dialogText()).toContain('Enter the time spent, at least 1 minute');
        });

        it('when the date is after today', () => {
            enter('duration', '1h');
            enter('workDate', addDays(startOfToday(), 1));

            expect(dialogText()).toContain('The date can\'t be after today');
            expect(component.canSave).toBeFalse();
        });

        it('when the date is missing', () => {
            enter('duration', '1h');
            enter('workDate', null);

            expect(dialogText()).toContain('Select the date of the work');
            expect(component.canSave).toBeFalse();
        });

        it('when the architect is missing', () => {
            enter('duration', '1h');
            enter('architectId', null);

            expect(dialogText()).toContain('Select the architect who did the work');
            expect(component.canSave).toBeFalse();
        });

        it('when the note is too long', () => {
            enter('duration', '1h');
            enter('note', 'a'.repeat(256));

            expect(dialogText()).toContain('Shorten the note to 255 characters or fewer');
            expect(component.canSave).toBeFalse();
        });

        it('but allows a full day', () => {
            enter('duration', '24h');

            expect(dialogText()).not.toContain('The time spent can\'t be more than 24 hours');
            expect(component.canSave).toBeTrue();
        });
    });
});
