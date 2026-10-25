import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';

import {GoogleCalendarSettingsStore} from './google-calendar-settings.state';
import {SystemParameterStore} from './system-parameter.state';
import {provideTestDependencies} from '../../../testing/test-providers';
import {SystemParameter} from '../../generated/models/system-parameter';
import {GoogleCalendarConnectionStatus} from '../../generated/models/google-calendar-connection-status';
import {CalendarShareRole} from '../../generated/models/calendar-share-role';

describe('GoogleCalendarSettingsStore', () => {
    let store: InstanceType<typeof GoogleCalendarSettingsStore>;
    let systemParameterStore: InstanceType<typeof SystemParameterStore>;
    let httpTesting: HttpTestingController;

    const credentials: SystemParameter = {id: 4, name: 'Google calendar credentials', type: 'SECRET', valueSet: false};
    const sync: SystemParameter = {id: 5, name: 'Google calendar sync', type: 'BOOLEAN', value: 'false'};

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(GoogleCalendarSettingsStore);
        systemParameterStore = TestBed.inject(SystemParameterStore);
        httpTesting = TestBed.inject(HttpTestingController);
        patchState(unprotected(systemParameterStore), {systemParameters: [credentials, sync]});
    });

    afterEach(() => httpTesting.verify());

    it('should save the parameters in order and check the connection once at the end', () => {
        store.saveParameters([{...credentials, value: '{"type": "service_account"}'}, {...sync, value: 'true'}]);
        expect(systemParameterStore.systemParametersSaving()).toBeTrue();

        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/4')).flush({...credentials, valueSet: true});
        httpTesting.expectNone(request => request.url.endsWith('/connection-status'));
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/5')).flush({...sync, value: 'true'});

        expect(systemParameterStore.systemParametersSaving()).toBeFalse();
        expect(systemParameterStore.systemParameters()).toEqual([{...credentials, valueSet: true}, {...sync, value: 'true'}]);
        httpTesting.expectOne(request => request.url.endsWith('/calendars/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.CONNECTED});
        expect(store.connection()?.status).toBe(GoogleCalendarConnectionStatus.CONNECTED);
        httpTesting.expectOne(request => request.url.endsWith('/calendars/shares')).flush([]);
    });

    it('should check the connection after a failed save too', () => {
        store.saveParameters([{...credentials, value: 'bad'}, {...sync, value: 'true'}]);
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/4'))
            .flush({message: 'Not valid'}, {status: 400, statusText: 'Bad request'});
        httpTesting.expectNone(request => request.url.endsWith('/system-parameters/5'));
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.NOT_CONFIGURED});

        expect(store.connection()?.status).toBe(GoogleCalendarConnectionStatus.NOT_CONFIGURED);
    });

    it('should mark the check as failed when the backend cannot be asked', () => {
        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush('', {status: 500, statusText: 'Server error'});

        expect(store.connectionCheckFailed()).toBeTrue();
        expect(store.connection()).toBeNull();
    });

    it('should load the shares once the calendar is reachable', () => {
        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.CONNECTED});
        httpTesting.expectOne(request => request.url.endsWith('/calendars/shares'))
            .flush([{email: 'john.doe@gmail.com', role: CalendarShareRole.READER}]);

        expect(store.shares()).toEqual([{email: 'john.doe@gmail.com', role: CalendarShareRole.READER}]);
        expect(store.sharesLoading()).toBeFalse();
    });

    it('should not load the shares when the calendar cannot be reached', () => {
        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.DISABLED});
        httpTesting.expectNone(request => request.url.endsWith('/calendars/shares'));

        expect(store.shares()).toEqual([]);
    });

    it('should keep the list on screen while a later check refreshes it', () => {
        let share = {email: 'john.doe@gmail.com', role: CalendarShareRole.READER};
        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.CONNECTED});
        httpTesting.expectOne(request => request.url.endsWith('/calendars/shares')).flush([share]);

        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.CONNECTED});

        expect(store.sharesLoading()).toBeFalse();
        expect(store.shares()).toEqual([share]);
        httpTesting.expectOne(request => request.url.endsWith('/calendars/shares')).flush([share]);
    });

    it('should drop a running shares load once the calendar cannot be reached', () => {
        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.CONNECTED});
        let sharesRequest = httpTesting.expectOne(request => request.url.endsWith('/calendars/shares'));

        store.checkConnection({});
        httpTesting.expectOne(request => request.url.endsWith('/connection-status'))
            .flush({status: GoogleCalendarConnectionStatus.DISABLED});

        expect(sharesRequest.cancelled).toBeTrue();
        expect(store.shares()).toEqual([]);
        expect(store.sharesLoading()).toBeFalse();
    });

    it('should add a new share to the list', () => {
        let share = {email: 'anna@gmail.com', role: CalendarShareRole.WRITER};
        store.addShare(share);
        expect(store.shareAdding()).toBeTrue();

        let request = httpTesting.expectOne(request => request.url.endsWith('/calendars/shares'));
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(share);
        request.flush(share);

        expect(store.shareAdding()).toBeFalse();
        expect(store.shares()).toEqual([share]);
    });

    it('should remove a revoked share from the list', () => {
        patchState(unprotected(store), {shares: [{email: 'john.doe@gmail.com', role: CalendarShareRole.READER}]});

        store.removeShare('john.doe@gmail.com');
        expect(store.shareRevoking()).toBe('john.doe@gmail.com');
        let request = httpTesting.expectOne(request => request.url.endsWith('/calendars/shares'));
        expect(request.request.method).toBe('DELETE');
        expect(request.request.params.get('email')).toBe('john.doe@gmail.com');
        request.flush(null);

        expect(store.shareRevoking()).toBeNull();
        expect(store.shares()).toEqual([]);
    });

    it('should keep the share when revoking fails', () => {
        patchState(unprotected(store), {shares: [{email: 'john.doe@gmail.com', role: CalendarShareRole.READER}]});

        store.removeShare('john.doe@gmail.com');
        httpTesting.expectOne(request => request.url.endsWith('/calendars/shares'))
            .flush({message: 'Google refused'}, {status: 502, statusText: 'Bad gateway'});

        expect(store.shareRevoking()).toBeNull();
        expect(store.shares().length).toBe(1);
    });
});
