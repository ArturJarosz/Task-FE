import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {UserStore} from './user.state';
import {UserConfigurationName} from '../../../generated/models/user-configuration-name';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('UserStore', () => {
    let store: InstanceType<typeof UserStore>;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(UserStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should flag a failed settings load and clear the flag on the next try', () => {
        store.loadConfigurations({});
        httpTesting.expectOne(request => request.url.endsWith('/users/current/configurations'))
            .flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.configurationsLoadFailed()).toBeTrue();
        expect(store.configurations()).toBeNull();

        store.loadConfigurations({});
        expect(store.configurationsLoadFailed()).toBeFalse();
        httpTesting.expectOne(request => request.url.endsWith('/users/current/configurations')).flush([]);

        expect(store.configurations()).toEqual([]);
    });

    it('should send a settings save only after the previous one is done, so the last one is saved last', () => {
        store.updateConfiguration({name: UserConfigurationName.THEME_MODE, value: 'DARK'});
        store.updateConfiguration({name: UserConfigurationName.THEME_MODE, value: 'LIGHT'});

        let first = httpTesting.expectOne(request => request.url.endsWith('/users/current/configurations/THEME_MODE'));
        expect(first.request.body.value).toBe('DARK');
        first.flush({name: UserConfigurationName.THEME_MODE, value: 'DARK'});

        let second = httpTesting.expectOne(request => request.url.endsWith('/users/current/configurations/THEME_MODE'));
        expect(second.request.body.value).toBe('LIGHT');
        second.flush({name: UserConfigurationName.THEME_MODE, value: 'LIGHT'});

        expect(store.configurations()?.find(configuration => configuration.name === UserConfigurationName.THEME_MODE)?.value)
            .toBe('LIGHT');
    });
});
