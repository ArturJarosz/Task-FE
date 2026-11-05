import {ComponentFixture, TestBed} from '@angular/core/testing';

import {QuickLog, TaskTimeCardComponent} from './task-time-card.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {TimeEntry} from '../../generated/models/time-entry';

const ARCHITECTS = [
    {id: 7, firstName: 'Anna', lastName: 'Nowak'},
    {id: 8, firstName: 'Piotr', lastName: 'Lis'},
];

describe('TaskTimeCardComponent', () => {
    let fixture: ComponentFixture<TaskTimeCardComponent>;
    let component: TaskTimeCardComponent;
    let logged: QuickLog[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskTimeCardComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(TaskTimeCardComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('architects', ARCHITECTS);
        fixture.componentRef.setInput('logArchitectId', 8);
        logged = [];
        component.quickLog.subscribe(quickLog => logged.push(quickLog));
    });

    function show(timeEntries: TimeEntry[], totalMinutes: number): void {
        fixture.componentRef.setInput('timeEntries', timeEntries);
        fixture.componentRef.setInput('totalMinutes', totalMinutes);
        fixture.detectChanges();
    }

    function text(): string {
        return (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ');
    }

    // Typed into the field itself, as a key press updates the OnPush card
    function type(value: string): void {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('#quickLogDuration');
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    function submit(): void {
        fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
        fixture.detectChanges();
    }

    function button(label: string): HTMLButtonElement | undefined {
        return Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
            .find(candidate => candidate.textContent?.trim() === label);
    }

    function hint(): string {
        return (fixture.nativeElement.querySelector('#quickLogHint').textContent ?? '').replace(/\s+/g, ' ').trim();
    }

    function peopleTexts(): string[] {
        return Array.from(fixture.nativeElement.querySelectorAll('li') as NodeListOf<HTMLElement>)
            .map(person => Array.from(person.children).map(part => (part.textContent ?? '').trim()).join(' '));
    }

    it('should show the total and the time of each person, most first', () => {
        show([
            {id: 1, architectId: 7, durationMinutes: 60},
            {id: 2, architectId: 8, durationMinutes: 300},
            {id: 3, architectId: 7, durationMinutes: 30},
        ], 390);

        expect(text()).toContain('6 h 30 min');
        expect(peopleTexts()).toEqual(['PL Piotr Lis 5 h', 'AN Anna Nowak 1 h 30 min']);
    });

    it('should open the entries from the link in the top right corner', () => {
        show([{id: 1, architectId: 7, durationMinutes: 60}], 60);
        const showEntries = jasmine.createSpy('showEntries');
        component.showEntries.subscribe(showEntries);

        button('Entries')!.click();

        expect(showEntries).toHaveBeenCalled();
    });

    it('should say so when no time is logged, without an entries link', () => {
        show([], 0);

        expect(text()).toContain('No time logged yet.');
        expect(button('Entries')).toBeUndefined();
        expect(text()).toContain('0 h');
    });

    it('should say when and for whom the time is logged, and open the dialog to change it', () => {
        show([], 0);
        const logTime = jasmine.createSpy('logTime');
        component.logTime.subscribe(logTime);

        expect(hint()).toBe('Today · Piotr Lis · Change');

        button('Change')!.click();

        expect(logTime).toHaveBeenCalled();
    });

    it('should log with the + button joined to the field', () => {
        show([], 0);
        const plus: HTMLButtonElement = fixture.nativeElement.querySelector('button[type=submit]');

        expect(plus.getAttribute('aria-label')).toBe('Log time for today');
        expect(plus.textContent?.trim()).toBe('');
    });

    it('should log the typed time and clear the field once it is saved', () => {
        show([], 0);
        type('2h30m');

        expect(hint()).toBe('2 h 30 min today · Piotr Lis · Change');

        submit();

        expect(logged.map(quickLog => quickLog.durationMinutes)).toEqual([150]);
        expect(component.duration.value).toBe('2h30m');

        logged[0].onSaved();
        fixture.detectChanges();

        expect(component.duration.value).toBe('');
        expect(hint()).toBe('Today · Piotr Lis · Change');
    });

    it('should count a number without a unit as hours', () => {
        show([], 0);
        type('1.5');
        submit();

        expect(logged.map(quickLog => quickLog.durationMinutes)).toEqual([90]);
    });

    describe('tells what to fix and logs nothing', () => {
        beforeEach(() => show([], 0));

        it('when the time can\'t be read', () => {
            type('soon');
            submit();

            expect(text()).toContain('Enter the time like 2h30m, 2h or 45m');
            // Who it is for, and "Change", stay in view
            expect(hint()).toBe('Today · Piotr Lis · Change');
            expect(logged).toEqual([]);
        });

        it('when nothing is typed', () => {
            submit();

            expect(text()).toContain('Enter the time spent, at least 1 minute');
            expect(logged).toEqual([]);
        });

        it('when the time is longer than a day', () => {
            type('25h');
            submit();

            expect(text()).toContain('The time spent can\'t be more than 24 hours');
            expect(logged).toEqual([]);
        });
    });

    it('should not flag a half-typed time while typing', () => {
        show([], 0);
        type('2.');

        expect(component.error).toBeNull();
    });

    it('should offer to try again when the entries failed to load', () => {
        fixture.componentRef.setInput('loadFailed', true);
        show([], 0);
        const reload = jasmine.createSpy('reload');
        component.reload.subscribe(reload);

        const button: HTMLButtonElement = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
            .find(candidate => candidate.textContent?.includes('Try again'))!;
        button.click();

        expect(reload).toHaveBeenCalled();
    });
});
