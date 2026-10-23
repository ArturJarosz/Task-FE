import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';

import {GoogleCalendarSettingsStore} from './google-calendar-settings.state';
import {SystemParameterStore} from './system-parameter.state';
import {provideTestDependencies} from '../../../testing/test-providers';
import {SystemParameter} from '../../generated/models/system-parameter';
import {GoogleCalendarConnectionStatus} from '../../generated/models/google-calendar-connection-status';

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
});
