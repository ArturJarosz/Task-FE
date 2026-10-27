import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {InstallmentStore} from './installment.state';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('InstallmentStore', () => {
    let store: InstanceType<typeof InstallmentStore>;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(InstallmentStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should drop the previous project\'s installments when the project changes', () => {
        store.setProjectId(1);
        store.loadProjectInstallments({});
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/installments-data'))
            .flush({installments: [{id: 1, stageId: 10, paymentDate: '2026-05-01'}]});
        expect(store.installmentProjectData().installments?.length).toBe(1);

        store.setProjectId(2);

        expect(store.installmentProjectData()).toEqual({});
        expect(store.installments()).toEqual([]);
    });

    it('should flag a failed load and load again on the next call', () => {
        store.setProjectId(3);
        store.loadProjectInstallments({});
        httpTesting.expectOne(request => request.url.endsWith('/projects/3/installments-data'))
            .flush('Server error', {status: 500, statusText: 'Server Error'});
        expect(store.installmentsLoadFailed()).toBeTrue();

        store.loadProjectInstallments({});
        expect(store.installmentsLoadFailed()).toBeFalse();
        httpTesting.expectOne(request => request.url.endsWith('/projects/3/installments-data')).flush({installments: []});
        expect(store.installmentsLoadFailed()).toBeFalse();
    });
});
