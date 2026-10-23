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

    it('should save a group of parameters in order and run afterSave once at the end', () => {
        let afterSave = jasmine.createSpy('afterSave');
        store.updateSystemParameters({
            systemParameters: [{...vatTax, value: '0.08'}, {...hourRate, value: '120'}],
            successMessage: 'Saved', afterSave: afterSave
        });
        expect(store.systemParametersSaving()).toBeTrue();

        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/1')).flush({...vatTax, value: '0.08'});
        expect(afterSave).not.toHaveBeenCalled();
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/2')).flush({...hourRate, value: '120'});

        expect(store.systemParametersSaving()).toBeFalse();
        expect(afterSave).toHaveBeenCalledTimes(1);
        expect(store.systemParameters()).toEqual([{...vatTax, value: '0.08'}, {...hourRate, value: '120'}]);
    });

    it('should stop a group at the first failed parameter and keep working', () => {
        let afterSave = jasmine.createSpy('afterSave');
        store.updateSystemParameters({
            systemParameters: [{...vatTax, value: 'bad'}, {...hourRate, value: '120'}],
            successMessage: 'Saved', afterSave: afterSave
        });
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/1'))
            .flush({message: 'Not valid'}, {status: 400, statusText: 'Bad request'});
        httpTesting.expectNone(request => request.url.endsWith('/system-parameters/2'));
        expect(store.systemParametersSaving()).toBeFalse();
        expect(afterSave).toHaveBeenCalledTimes(1);
        expect(store.systemParameters()).toEqual([vatTax, hourRate]);

        store.updateSystemParameters({systemParameters: [{...hourRate, value: '120'}], successMessage: 'Saved'});
        httpTesting.expectOne(request => request.url.endsWith('/system-parameters/2')).flush({...hourRate, value: '120'});
        expect(store.systemParameters()).toEqual([vatTax, {...hourRate, value: '120'}]);
    });
});
