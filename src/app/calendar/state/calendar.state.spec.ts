import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {CalendarStore} from './calendar.state';
import {provideTestDependencies} from '../../../testing/test-providers';
import {CalendarEvent} from '../../generated/models/calendar-event';
import {toTimeZoneString} from '../../shared/utils/date-utils';

describe('CalendarStore', () => {
    let store: InstanceType<typeof CalendarStore>;
    let httpTesting: HttpTestingController;

    const older: CalendarEvent = {id: 1, name: 'Site visit', startDateTime: '2026-09-01T10:00:00'};
    const newer: CalendarEvent = {id: 2, name: 'Client meeting', startDateTime: '2026-10-20T09:00:00'};

    function daysFromToday(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return toTimeZoneString(date)!;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(CalendarStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should load upcoming events from today without an end date, soonest first', () => {
        store.loadUpcomingEvents({});

        const request = httpTesting.expectOne(request => request.url.endsWith('/calendars/events'));
        expect(request.request.params.get('startDate')).toBe(daysFromToday(0));
        expect(request.request.params.has('endDate')).toBeFalse();
        request.flush([newer, older]);

        expect(store.upcomingEvents()).toEqual([older, newer]);
    });

    it('should refresh event lists after an event is deleted', () => {
        store.deleteCalendarEvent({eventId: 1});
        httpTesting.expectOne(request => request.url.endsWith('/calendars/events/1')).flush(null);

        expect(store.upcomingEventsNeedRefresh()).toBeTrue();
        expect(store.connectedEventsNeedRefresh()).toBeTrue();
    });
});
