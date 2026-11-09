import {TestBed} from '@angular/core/testing';
import {of, Subject, throwError} from 'rxjs';

import {chargesKey, CompanyCostStore} from './company-cost.state';
import {CompanyCostRestService} from '../rest/company-cost-rest.service';
import {FinancialReportStore} from '../../financial-report/state/financial-report.state';
import {DashboardStore} from '../../dashboard/state/dashboard.state';
import {CompanyCost} from '../../generated/models/company-cost';
import {CompanyCostCharge} from '../../generated/models/company-cost-charge';
import {CompanyCostKind} from '../../generated/models/company-cost-kind';
import {CompanyCostRepeats} from '../../generated/models/company-cost-repeats';
import {provideTestDependencies} from '../../../testing/test-providers';

const ADOBE: CompanyCost = {
    id: 5, name: 'Adobe Creative Cloud', kind: CompanyCostKind.RECURRING, repeats: CompanyCostRepeats.MONTHLY,
    startMonth: '2024-03-01', chargeDay: 15, netValue: 289
};
const CHARGE: CompanyCostCharge = {chargeMonth: '2026-11-01', chargeDate: '2026-11-15', netValue: 289, paid: false};

describe('CompanyCostStore', () => {
    let store: InstanceType<typeof CompanyCostStore>;
    let restService: jasmine.SpyObj<CompanyCostRestService>;

    beforeEach(() => {
        restService = jasmine.createSpyObj<CompanyCostRestService>('CompanyCostRestService', ['getCompanyCosts',
            'getCompanyCost', 'createCompanyCost', 'updateCompanyCost', 'deleteCompanyCost', 'getCharges',
            'createAmount', 'updateAmount', 'deleteAmount', 'createPayment', 'updatePayment', 'deletePayment']);
        restService.getCompanyCosts.and.returnValue(of([ADOBE]));
        restService.getCompanyCost.and.returnValue(of(ADOBE));
        restService.getCharges.and.returnValue(of([CHARGE]));
        TestBed.configureTestingModule({
            providers: [...provideTestDependencies(), {provide: CompanyCostRestService, useValue: restService}]
        });
        store = TestBed.inject(CompanyCostStore);
    });

    function spyOnReports() {
        return {
            report: spyOn(TestBed.inject(FinancialReportStore), 'setReportNeedsRefresh'),
            dashboard: spyOn(TestBed.inject(DashboardStore), 'setReportNeedsRefresh'),
        };
    }

    it('should load the costs once until something changes', () => {
        store.loadCompanyCosts();
        store.loadCompanyCosts();

        expect(restService.getCompanyCosts).toHaveBeenCalledTimes(1);
        expect(store.companyCosts()).toEqual([ADOBE]);
        expect(store.companyCostsNeedRefresh()).toBeFalse();
    });

    it('should flag a failed load and load again on the next call', () => {
        restService.getCompanyCosts.and.returnValue(throwError(() => 'Response code: 500'));
        store.loadCompanyCosts();
        expect(store.companyCostsLoadFailed()).toBeTrue();

        restService.getCompanyCosts.and.returnValue(of([ADOBE]));
        store.loadCompanyCosts();
        expect(store.companyCostsLoadFailed()).toBeFalse();
        expect(store.companyCosts()).toEqual([ADOBE]);
    });

    it('should load the costs of a period again, without the rows of the previous one', () => {
        store.loadCompanyCosts();
        const periodLoad = new Subject<CompanyCost[]>();
        restService.getCompanyCosts.and.returnValue(periodLoad);
        const period = {startDate: '2026-01-01', endDate: '2026-06-30'};

        store.setPeriod(period);
        expect(restService.getCompanyCosts).toHaveBeenCalledWith(period);
        expect(store.companyCosts()).toEqual([]);
        periodLoad.next([ADOBE]);

        expect(store.companyCosts()).toEqual([ADOBE]);

        store.setPeriod({...period});
        expect(store.companyCostsNeedRefresh()).toBeFalse();
    });

    it('should load a new period while the load of the previous one runs', () => {
        const firstLoad = new Subject<CompanyCost[]>();
        restService.getCompanyCosts.and.returnValues(firstLoad, of([ADOBE]));
        const period = {startDate: '2026-01-01', endDate: '2026-03-31'};
        store.setPeriod(period);

        store.setPeriod(null);
        firstLoad.next([]);

        expect(restService.getCompanyCosts.calls.mostRecent().args).toEqual([null]);
        expect(store.companyCosts()).toEqual([ADOBE]);
        expect(store.companyCostsNeedRefresh()).toBeFalse();
    });

    it('should hold the charges with the cost and year they belong to', () => {
        store.setCompanyCostId(5);
        store.setChargesYear(2026);

        expect(restService.getCharges).toHaveBeenCalledWith(5, 2026);
        expect(store.charges()).toEqual([CHARGE]);
        expect(store.chargesKey()).toBe(chargesKey(5, 2026));
    });

    it('should load the charges of the last year of a cost that has none this year', () => {
        restService.getCompanyCost.and.returnValue(of({
            ...ADOBE, kind: CompanyCostKind.ONE_TIME, repeats: undefined, startMonth: undefined, date: '2025-04-10'
        }));
        store.setCompanyCostId(5);

        store.loadCompanyCost();

        expect(store.chargesYear()).toBe(2025);
        expect(restService.getCharges).toHaveBeenCalledWith(5, 2025);
    });

    it('should mark a charge as paid, reload the cost and its charges and mark the reports stale', () => {
        const reports = spyOnReports();
        restService.createPayment.and.returnValue(of({id: 9, chargeMonth: '2026-11-01', paymentDate: '2026-11-07'}));
        store.setCompanyCostId(5);
        const afterSave = jasmine.createSpy('afterSave');

        store.savePayment({companyCostId: 5, payment: {chargeMonth: '2026-11-01', paymentDate: '2026-11-07'}, afterSave});

        expect(restService.createPayment).toHaveBeenCalledOnceWith(5, {chargeMonth: '2026-11-01', paymentDate: '2026-11-07'});
        expect(afterSave).toHaveBeenCalled();
        expect(restService.getCompanyCost).toHaveBeenCalledWith(5);
        expect(restService.getCharges).toHaveBeenCalled();
        expect(store.companyCostsNeedRefresh()).toBeTrue();
        expect(reports.report).toHaveBeenCalled();
        expect(reports.dashboard).toHaveBeenCalled();
        expect(store.saving()).toBeFalse();
    });

    it('should keep a dialog open when saving fails', () => {
        const reports = spyOnReports();
        restService.updateCompanyCost.and.returnValue(throwError(() => 'Response code: 400'));
        const afterSave = jasmine.createSpy('afterSave');

        store.updateCompanyCost({companyCostId: 5, companyCost: ADOBE, afterSave});

        expect(afterSave).not.toHaveBeenCalled();
        expect(reports.report).not.toHaveBeenCalled();
        expect(store.saving()).toBeFalse();
    });

    it('should take the saved cost from the response of an amount change', () => {
        const changed = {...ADOBE, netValue: 319};
        restService.createAmount.and.returnValue(of(changed));
        store.setCompanyCostId(5);

        store.saveAmount({companyCostId: 5, amount: {validFrom: '2026-12-01', netValue: 319}});

        expect(restService.createAmount).toHaveBeenCalled();
        expect(restService.getCompanyCost).not.toHaveBeenCalled();
        expect(store.companyCost()).toEqual(changed);
    });

    it('should forget a deleted cost of the detail page', () => {
        restService.deleteCompanyCost.and.returnValue(of(undefined));
        store.setCompanyCostId(5);
        store.loadCompanyCost();

        store.deleteCompanyCost({companyCost: ADOBE});

        expect(store.companyCost()).toBeNull();
        expect(store.companyCostId()).toBeUndefined();
        expect(restService.getCompanyCost).toHaveBeenCalledTimes(1);
        expect(restService.getCharges).not.toHaveBeenCalled();
    });
});
