import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {ConfirmationService} from 'primeng/api';

import {ConnectedEventsComponent} from './connected-events.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {toTimeZoneString} from '../../shared/utils/date-utils';
import {CalendarEvent} from '../../generated/models/calendar-event';
import {
    PAST_EVENTS_SHOWN_PARAMETER,
    SystemParameterStore,
    UPCOMING_EVENTS_SHOWN_PARAMETER
} from '../../settings/state/system-parameter.state';

function daysFromToday(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${toTimeZoneString(date)}T10:00:00`;
}

describe('ConnectedEventsComponent', () => {
    let fixture: ComponentFixture<ConnectedEventsComponent>;
    let component: ConnectedEventsComponent;
    let httpTesting: HttpTestingController;

    const today: CalendarEvent = {id: 1, name: 'Today', startDateTime: daysFromToday(0), endDateTime: daysFromToday(0)};
    const soon: CalendarEvent = {id: 2, name: 'Soon', startDateTime: daysFromToday(3), endDateTime: daysFromToday(3)};
    const past: CalendarEvent = {id: 3, name: 'Past', startDateTime: daysFromToday(-3), endDateTime: daysFromToday(-3)};

    function eventsRequest(param: string, value: string) {
        return httpTesting.expectOne(request => request.url.endsWith('/calendars/events')
            && request.params.get(param) === value);
    }

    function open(inputs: {clientId?: number, projectId?: number}): void {
        fixture.componentRef.setInput('clientId', inputs.clientId);
        fixture.componentRef.setInput('projectId', inputs.projectId);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ConnectedEventsComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(ConnectedEventsComponent);
        component = fixture.componentInstance;
        httpTesting = TestBed.inject(HttpTestingController);
    });

    it('should load the events of a project and split them into upcoming and past', () => {
        open({clientId: 5, projectId: 7});
        eventsRequest('projectId', '7').flush([soon, past, today]);
        fixture.detectChanges();

        expect(component.upcomingEvents().map(event => event.id)).toEqual([1, 2]);
        expect(component.pastEvents().map(event => event.id)).toEqual([3]);
        expect(fixture.nativeElement.textContent).toContain('Soon');
        expect(fixture.nativeElement.textContent).not.toContain('Past event');
    });

    it('should load the events of a client', () => {
        open({clientId: 5});

        eventsRequest('clientId', '5').flush([]);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No upcoming events');
    });

    it('should load all events when given no client or project', () => {
        open({});

        httpTesting.expectOne(request => request.url.endsWith('/calendars/events') && request.params.keys().length === 0)
            .flush([soon]);
        expect(component.upcomingEvents().map(event => event.id)).toEqual([2]);
    });

    it('should show only as many events as the settings say, closest to today first', () => {
        const parameters = TestBed.inject(SystemParameterStore);
        parameters.loadSystemParameters({});
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters')).flush([
            {id: 1, name: UPCOMING_EVENTS_SHOWN_PARAMETER, type: 'NUMBER', value: '1'},
            {id: 2, name: PAST_EVENTS_SHOWN_PARAMETER, type: 'NUMBER', value: '1'},
        ]);
        const older: CalendarEvent = {id: 4, name: 'Older', startDateTime: daysFromToday(-9), endDateTime: daysFromToday(-9)};

        open({projectId: 7});
        eventsRequest('projectId', '7').flush([soon, today, past, older]);
        fixture.detectChanges();

        expect(component.shownUpcomingEvents().map(event => event.id)).toEqual([1]);
        expect(component.shownPastEvents().map(event => event.id)).toEqual([3]);
        expect(fixture.nativeElement.textContent).toContain('1 of 2 events');
    });

    it('should not show events of another project while the new ones load', () => {
        open({projectId: 7});
        eventsRequest('projectId', '7').flush([soon]);

        open({projectId: 8});
        expect(component.calendarStore.connectedEvents()).toEqual([]);
        eventsRequest('projectId', '8').flush([today]);
        expect(component.upcomingEvents().map(event => event.id)).toEqual([1]);
    });

    it('should show an error with a way to try again when loading fails', () => {
        open({projectId: 7});
        eventsRequest('projectId', '7').flush('', {status: 500, statusText: 'Server error'});
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain("Couldn't load the events");

        component.reload();
        eventsRequest('projectId', '7').flush([soon]);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Soon');
    });

    it('should reload the list after an event is deleted', () => {
        open({projectId: 7});
        eventsRequest('projectId', '7').flush([soon]);
        const confirm = spyOn(TestBed.inject(ConfirmationService), 'confirm');

        component.onDeleteEvent(soon);
        confirm.calls.mostRecent().args[0].accept!();
        httpTesting.expectOne(request => request.method === 'DELETE').flush(null);
        fixture.detectChanges();
        TestBed.tick();

        eventsRequest('projectId', '7').flush([]);
        expect(component.upcomingEvents()).toEqual([]);
    });
});
