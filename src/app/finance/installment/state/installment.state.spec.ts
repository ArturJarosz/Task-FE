import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {InstallmentStore} from './installment.state';
import {provideTestDependencies} from '../../../../testing/test-providers';
import {InstallmentType} from '../../../generated/models';

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

    it('should know whether the project has a deposit only once its installments are loaded', () => {
        store.setProjectId(1);
        expect(store.hasDeposit()).toBeNull();

        store.loadProjectInstallments({});
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/installments-data')).flush({hasDeposit: true});
        expect(store.hasDeposit()).toBeTrue();

        store.setProjectId(2);
        store.loadProjectInstallments({});
        httpTesting.expectOne(request => request.url.endsWith('/projects/2/installments-data'))
            .flush('Server error', {status: 500, statusText: 'Server Error'});
        expect(store.hasDeposit()).toBeNull();
    });

    it('should create a stage installment through its stage', () => {
        store.setProjectId(1);
        store.createInstallment({installment: {type: InstallmentType.STAGE, stageId: 10, value: 1000}});

        httpTesting.expectOne(request => request.method === 'POST' && request.url.endsWith('/projects/1/stages/10/installments'))
            .flush({id: 8, stageId: 10, value: 1000});
    });

    describe('saving an installment', () => {
        const INSTALLMENT_URL = '/projects/1/installments/5';
        const PAY_URL = `${INSTALLMENT_URL}/pay`;
        const isUpdate = (request: { method: string, url: string }) => request.method === 'PUT' && request.url.endsWith(INSTALLMENT_URL);
        const isPay = (request: { method: string, url: string }) => request.method === 'POST' && request.url.endsWith(PAY_URL);
        const isReload = (request: { method: string, url: string }) => request.method === 'GET' && request.url.endsWith(INSTALLMENT_URL);

        beforeEach(() => {
            store.setProjectId(1);
            store.setInstallmentId(5);
        });

        it('should only call the update when nothing is paid', () => {
            store.saveInstallment({installment: {value: 1200, paid: false}});

            httpTesting.expectOne(isUpdate).flush({id: 5, stageName: ''});
            httpTesting.expectNone(isPay);
            httpTesting.expectOne(isReload).flush({id: 5, stageName: 'Stage 1', value: 1200});

            expect(store.installment()).toEqual({id: 5, stageName: 'Stage 1', value: 1200});
        });

        it('should only call the payment when paying is the only change', () => {
            store.saveInstallment({paymentDate: '2026-10-20'});

            httpTesting.expectNone(isUpdate);
            let pay = httpTesting.expectOne(isPay);
            expect(pay.request.body).toEqual({paymentDate: '2026-10-20'});
            pay.flush({id: 5, stageName: ''});
            httpTesting.expectOne(isReload).flush({id: 5, stageName: 'Stage 1', paid: true});

            expect(store.installment().paid).toBeTrue();
        });

        it('should pay only after the update has finished', () => {
            store.saveInstallment({installment: {value: 1200, paid: false}, paymentDate: '2026-10-20'});

            let update = httpTesting.expectOne(isUpdate);
            httpTesting.expectNone(isPay);
            update.flush({id: 5, stageName: ''});
            httpTesting.expectOne(isPay).flush({id: 5, stageName: ''});
            httpTesting.expectOne(isReload).flush({id: 5, stageName: 'Stage 1', value: 1200, paid: true});

            expect(store.installment()).toEqual({id: 5, stageName: 'Stage 1', value: 1200, paid: true});
        });

        it('should show what was saved when the payment fails after the update', () => {
            store.saveInstallment({installment: {value: 1200, paid: false}, paymentDate: '2026-10-20'});

            httpTesting.expectOne(isUpdate).flush({id: 5, stageName: ''});
            httpTesting.expectOne(isPay).flush('Bad request', {status: 400, statusText: 'Bad Request'});
            httpTesting.expectOne(isReload).flush({id: 5, stageName: 'Stage 1', value: 1200, paid: false});

            expect(store.installment()).toEqual({id: 5, stageName: 'Stage 1', value: 1200, paid: false});
        });
    });
});
