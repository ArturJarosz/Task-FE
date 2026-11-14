import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {ContractStore} from './contract.store';
import {InstallmentStore} from '../../../finance/installment/state/installment.state';
import {ProjectTimeSummaryStore} from '../../state/project-time-summary.state';
import {provideTestDependencies} from '../../../../testing/test-providers';
import {ContractStatus, InstallmentType} from '../../../generated/models';

describe('ContractStore', () => {
    let store: InstanceType<typeof ContractStore>;
    let installmentStore: InstanceType<typeof InstallmentStore>;
    let httpTesting: HttpTestingController;
    const isStatusChange = (request: { method: string, url: string }) =>
        request.method === 'POST' && request.url.endsWith('/contracts/4/status');

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(ContractStore);
        installmentStore = TestBed.inject(InstallmentStore);
        httpTesting = TestBed.inject(HttpTestingController);
        store.setContractId(4);
    });

    afterEach(() => httpTesting.verify());

    it('should send the deposit with the signed contract and reload the installments', () => {
        installmentStore.setProjectId(1);
        installmentStore.loadProjectInstallments({});
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/installments-data')).flush({installments: []});
        expect(installmentStore.installmentsNeedRefresh()).toBeFalse();

        store.changeStatus({contract: {status: ContractStatus.SIGNED, deposit: {type: InstallmentType.DEPOSIT, value: 3000}}});

        const request = httpTesting.expectOne(isStatusChange);
        expect(request.request.body.deposit).toEqual({type: InstallmentType.DEPOSIT, value: 3000});
        request.flush({id: 4, status: ContractStatus.SIGNED});
        expect(installmentStore.installmentsNeedRefresh()).toBeTrue();
    });

    it('should mark the time summary stale, as the rates per hour depend on the contract', () => {
        const timeSummaryStore = TestBed.inject(ProjectTimeSummaryStore);
        timeSummaryStore.setProjectId(1);
        timeSummaryStore.loadTimeSummary();
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/time-summary')).flush({totalMinutes: 60});
        expect(timeSummaryStore.timeSummaryNeedsRefresh()).toBeFalse();

        store.changeStatus({contract: {status: ContractStatus.SIGNED, offerValue: 5000}});
        httpTesting.expectOne(isStatusChange).flush({id: 4, status: ContractStatus.SIGNED});

        expect(timeSummaryStore.timeSummaryNeedsRefresh()).toBeTrue();
    });

    it('should keep saving after a failed status change', () => {
        store.changeStatus({contract: {status: ContractStatus.SIGNED}});
        httpTesting.expectOne(isStatusChange).flush('Bad request', {status: 400, statusText: 'Bad Request'});

        store.changeStatus({contract: {status: ContractStatus.SIGNED}});
        httpTesting.expectOne(isStatusChange).flush({id: 4, status: ContractStatus.SIGNED});
    });

    it('should update the contract without changing its status and mark the time summary stale', () => {
        const timeSummaryStore = TestBed.inject(ProjectTimeSummaryStore);
        timeSummaryStore.setProjectId(1);
        timeSummaryStore.loadTimeSummary();
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/time-summary')).flush({totalMinutes: 60});

        store.updateContract({contract: {status: ContractStatus.OFFER, deadline: '2027-01-15'}});

        const request = httpTesting.expectOne(request => request.method === 'PUT' && request.url.endsWith('/contracts/4'));
        expect(request.request.body.deadline).toBe('2027-01-15');
        request.flush({id: 4, status: ContractStatus.OFFER, deadline: '2027-01-15'});
        expect(timeSummaryStore.timeSummaryNeedsRefresh()).toBeTrue();
    });

    it('should run afterSave only when the save worked', () => {
        const isUpdate = (request: { method: string, url: string }) =>
            request.method === 'PUT' && request.url.endsWith('/contracts/4');
        const afterSave = jasmine.createSpy('afterSave');
        store.updateContract({contract: {status: ContractStatus.OFFER}, afterSave});
        expect(store.saving()).toBeTrue();
        httpTesting.expectOne(isUpdate).flush({message: 'Contract deadline has to be future date.'},
            {status: 400, statusText: 'Bad Request'});

        expect(afterSave).not.toHaveBeenCalled();
        expect(store.saving()).toBeFalse();

        store.updateContract({contract: {status: ContractStatus.OFFER}, afterSave});
        httpTesting.expectOne(isUpdate).flush({id: 4, status: ContractStatus.OFFER});

        expect(afterSave).toHaveBeenCalled();
    });

    it('should keep saving after a failed update', () => {
        const isUpdate = (request: { method: string, url: string }) =>
            request.method === 'PUT' && request.url.endsWith('/contracts/4');
        store.updateContract({contract: {status: ContractStatus.OFFER}});
        httpTesting.expectOne(isUpdate).flush('Bad request', {status: 400, statusText: 'Bad Request'});

        store.updateContract({contract: {status: ContractStatus.OFFER}});
        httpTesting.expectOne(isUpdate).flush({id: 4, status: ContractStatus.OFFER});
    });
});
