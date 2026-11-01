import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {ContractStore} from './contract.store';
import {InstallmentStore} from '../../../finance/installment/state/installment.state';
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

    it('should keep saving after a failed status change', () => {
        store.changeStatus({contract: {status: ContractStatus.SIGNED}});
        httpTesting.expectOne(isStatusChange).flush('Bad request', {status: 400, statusText: 'Bad Request'});

        store.changeStatus({contract: {status: ContractStatus.SIGNED}});
        httpTesting.expectOne(isStatusChange).flush({id: 4, status: ContractStatus.SIGNED});
    });
});
