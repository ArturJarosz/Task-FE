import {Component, inject, OnInit, Signal} from '@angular/core';
import {FinancialReportStore} from "../state/financial-report.state";
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";

import {FinancialReportComponent} from "../financial-report/financial-report.component";

@Component({
    selector: 'financial-report-shell',
    templateUrl: './financial-report-shell.component.html',
    styleUrl: './financial-report-shell.component.less',
    standalone: true,
    imports: [FinancialReportComponent]
})
export class FinancialReportShellComponent implements OnInit {
    readonly financialReportStore = inject(FinancialReportStore);

    $financialReport: Signal<FinancialReport | null> = this.financialReportStore.financialReport;
    $startDate: Signal<Date> = this.financialReportStore.startDate;
    $endDate: Signal<Date> = this.financialReportStore.endDate;
    $periodType: Signal<PeriodType> = this.financialReportStore.periodType;
    $loading: Signal<boolean> = this.financialReportStore.loading;

    ngOnInit(): void {
        this.financialReportStore.loadReport({});
    }

    onDateRangeChange(event: { startDate: Date, endDate: Date }): void {
        this.financialReportStore.setDateRange(event.startDate, event.endDate);
    }

    onPeriodTypeChange(periodType: PeriodType): void {
        this.financialReportStore.setPeriodType(periodType);
    }

    onGenerate(): void {
        this.financialReportStore.loadReport({});
    }
}
