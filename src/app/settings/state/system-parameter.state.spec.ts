import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';

import {SystemParameterStore} from './system-parameter.state';
import {provideTestDependencies} from '../../../testing/test-providers';
import {SystemParameter} from '../../generated/models/system-parameter';

describe('SystemParameterStore', () => {
    let store: InstanceType<typeof SystemParameterStore>;
    let httpTesting: HttpTestingController;

    const vatTax: SystemParameter = {id: 1, name: 'Vat tax', type: 'DECIMAL_NUMBER', value: '0.23'};
    const hourRate: SystemParameter = {id: 2, name: 'Hour rate', type: 'NUMBER', value: '100'};

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(SystemParameterStore);
        httpTesting = TestBed.inject(HttpTestingController);
        patchState(unprotected(store), {systemParameters: [vatTax, hourRate]});
    });

    afterEach(() => httpTesting.verify());

    it('should keep both results when a second save starts before the first one returns', () => {
        store.updateSystemParameter({systemParameter: {...vatTax, value: '0.08'}});
        store.updateSystemParameter({systemParameter: {...hourRate, value: '120'}});

        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/1')).flush({...vatTax, value: '0.08'});
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/2')).flush({...hourRate, value: '120'});

        expect(store.systemParameters()).toEqual([{...vatTax, value: '0.08'}, {...hourRate, value: '120'}]);
    });
});
