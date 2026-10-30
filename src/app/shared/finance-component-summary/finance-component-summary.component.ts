import {Component, Input, OnChanges} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {
    FinanceObjectSummaryForm
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";
import {CurrencyPipe} from "@angular/common";

export interface FinanceStat {
    label: string;
    value: number | null | undefined;
    money: boolean;
}

// Summary strip above a finance component table: count, paid and the money totals in one row.
@Component({
    selector: 'finance-component-summary',
    templateUrl: './finance-component-summary.component.html',
    styleUrl: './finance-component-summary.component.less',
    standalone: true,
    imports: [CurrencyPipe]
})
export class FinanceComponentSummaryComponent implements OnChanges {
    @Input()
    financeComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
    @Input()
    hasAveragedData: boolean = false;
    @Input()
    averageFinanceComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;

    stats: FinanceStat[] = toStats({});
    averageStats: FinanceStat[] = toMoneyStats({});

    // The parents pass a new, already filled form whenever their data changes, so the stats are built only here
    ngOnChanges(): void {
        this.stats = toStats(this.financeComponentDataForm?.value ?? {});
        this.averageStats = toMoneyStats(this.averageFinanceComponentDataForm?.value ?? {});
    }
}

type SummaryValue = FormGroup<FinanceObjectSummaryForm>['value'];

function toStats(value: SummaryValue): FinanceStat[] {
    return [
        {label: 'Count', value: value.count, money: false},
        {label: 'Paid', value: value.paid, money: false},
        ...toMoneyStats(value)
    ];
}

function toMoneyStats(value: SummaryValue): FinanceStat[] {
    return [
        {label: 'Gross value', value: value.grossValue, money: true},
        {label: 'Net value', value: value.netValue, money: true},
        {label: 'Income tax', value: value.incomeTax, money: true},
        {label: 'VAT', value: value.vatTax, money: true},
    ];
}
