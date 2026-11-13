import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {CalendarStore, GOOGLE_CONNECTION_MAX_AGE_MS} from './calendar.state';
import {provideTestDependencies} from '../../../testing/test-providers';
import {CalendarEvent} from '../../generated/models/calendar-event';
import {toTimeZoneString} from '../../shared/utils/date-utils';
import {GoogleCalendarConnectionStatus} from '../../generated/models/google-calendar-connection-status';

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

    describe('Google Calendar sync issue', () => {
        function connectionRequest() {
            return httpTesting.expectOne(request => request.url.endsWith('/calendars/connection-status'));
        }

        it('should have no issue before the first check ends or when sync works', () => {
            store.loadGoogleConnection();
            expect(store.googleSyncIssue()).toBeNull();

            connectionRequest().flush({status: 'CONNECTED'});
            expect(store.googleSyncIssue()).toBeNull();
        });

        it('should be the connection status when sync does not work', () => {
            store.loadGoogleConnection();
            connectionRequest().flush({status: 'NOT_CONFIGURED'});

            expect(store.googleSyncIssue()).toBe('NOT_CONFIGURED');
        });

        it('should be unknown when the server could not be asked', () => {
            store.loadGoogleConnection();
            connectionRequest().flush(null, {status: 500, statusText: 'Server Error'});

            expect(store.googleSyncIssue()).toBe('UNKNOWN');
        });

        it('should ask the server again only once the last check is too old', () => {
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date(2026, 10, 13, 10, 0));
            try {
                store.loadGoogleConnection();
                store.loadGoogleConnection();
                connectionRequest().flush({status: 'CONNECTION_FAILED'});
                store.loadGoogleConnection();
                httpTesting.expectNone(request => request.url.endsWith('/calendars/connection-status'));

                jasmine.clock().tick(GOOGLE_CONNECTION_MAX_AGE_MS + 1);
                store.loadGoogleConnection();
                connectionRequest().flush({status: 'CONNECTED'});

                expect(store.googleSyncIssue()).toBeNull();
            } finally {
                jasmine.clock().uninstall();
            }
        });

        it('should keep the last answer while checking again', () => {
            store.loadGoogleConnection();
            connectionRequest().flush({status: 'CONNECTION_FAILED'});

            store.checkGoogleConnection();
            expect(store.googleConnectionChecking()).toBeTrue();
            expect(store.googleSyncIssue()).toBe('CONNECTION_FAILED');

            connectionRequest().flush({status: 'CONNECTED'});
            expect(store.googleConnectionChecking()).toBeFalse();
            expect(store.googleSyncIssue()).toBeNull();
        });

        it('should let a check made in Settings replace a running one', () => {
            store.loadGoogleConnection();
            const running = connectionRequest();

            store.setGoogleConnection({status: GoogleCalendarConnectionStatus.CONNECTED});

            expect(running.cancelled).toBeTrue();
            expect(store.googleSyncIssue()).toBeNull();
            expect(store.googleConnectionChecking()).toBeFalse();
        });
    });
});
