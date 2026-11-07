import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {FinancialReportStore} from './financial-report.state';
import {FinancialDataStore} from '../../finance/project-financial-summary/state/financial-data.state';
import {PeriodType} from '../../generated/models/period-type';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('FinancialReportStore', () => {
    let store: InstanceType<typeof FinancialReportStore>;
    let httpTesting: HttpTestingController;

    const isReportRequest = (request: {url: string}) => request.url.endsWith('/financial-data');

    function loadReport(): void {
        store.loadReport({});
        httpTesting.expectOne(isReportRequest).flush({periods: []});
    }

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(FinancialReportStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should not call the backend again while nothing changed', () => {
        loadReport();

        store.loadReport({});

        httpTesting.expectNone(isReportRequest);
        expect(store.financialReport()).toEqual({periods: []});
        expect(store.loading()).toBeFalse();
    });

    it('should load again when the dates or period change', () => {
        loadReport();
        store.setPeriodType(PeriodType.YEARLY);
        loadReport();

        store.setDateRange(new Date(2026, 0, 1), new Date(2026, 5, 1));
        loadReport();
    });

    it('should load again after any finance change', () => {
        loadReport();
        TestBed.inject(FinancialDataStore).setProjectFinancialDataNeedsUpdate();

        loadReport();
    });

    it('should not load again only because another project was opened', () => {
        loadReport();
        TestBed.inject(FinancialDataStore).setProjectId(5);

        store.loadReport({});
        httpTesting.expectNone(isReportRequest);
    });

    it('should load again after a failed load', () => {
        store.loadReport({});
        httpTesting.expectOne(isReportRequest).flush('', {status: 500, statusText: 'Server error'});
        expect(store.loadFailed()).toBeTrue();

        loadReport();
        expect(store.loadFailed()).toBeFalse();
    });
});
