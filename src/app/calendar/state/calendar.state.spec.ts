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

    it('should load past events from the last 90 days up to yesterday, newest first', () => {
        store.loadPastEvents({});

        const request = httpTesting.expectOne(request => request.url.endsWith('/calendars/events'));
        expect(request.request.params.get('startDate')).toBe(daysFromToday(-90));
        expect(request.request.params.get('endDate')).toBe(daysFromToday(-1));
        request.flush([older, newer]);

        expect(store.pastEvents()).toEqual([newer, older]);
        expect(store.pastEventsNeedRefresh()).toBeFalse();
    });

    it('should load past events again after a failed load', () => {
        store.loadPastEvents({});
        httpTesting.expectOne(request => request.url.endsWith('/calendars/events'))
            .flush('', {status: 500, statusText: 'Server error'});
        expect(store.pastEventsNeedRefresh()).toBeTrue();

        store.loadPastEvents({});
        httpTesting.expectOne(request => request.url.endsWith('/calendars/events')).flush([older]);
        expect(store.pastEvents()).toEqual([older]);
    });

    it('should refresh past events after an event is deleted', () => {
        store.deleteCalendarEvent({eventId: 1});
        httpTesting.expectOne(request => request.url.endsWith('/calendars/events/1')).flush(null);

        expect(store.pastEventsNeedRefresh()).toBeTrue();
    });
});
