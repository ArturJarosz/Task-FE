import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {UserStore} from './user.state';
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
});
