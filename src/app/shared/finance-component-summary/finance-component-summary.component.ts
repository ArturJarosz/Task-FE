import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {
    FinanceObjectSummaryForm
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";
import {CurrencyPipe} from "@angular/common";
import {ButtonModule} from "primeng/button";

export interface FinanceStat {
    label: string;
    value: number | null | undefined;
    money: boolean;
}

// Summary strip above a finance component table: count, paid and the money totals in one row, with the average per
// item under each total where the parent passes one. Under it, the list's add button when it has one.
@Component({
    selector: 'finance-component-summary',
    templateUrl: './finance-component-summary.component.html',
    styleUrl: './finance-component-summary.component.less',
    standalone: true,
    imports: [CurrencyPipe, ButtonModule]
})
export class FinanceComponentSummaryComponent implements OnChanges {
    @Input()
    financeComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
    @Input()
    hasAveragedData: boolean = false;
    @Input()
    averageFinanceComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;

    // The add button of the list ("Add cost"): under the figures, right above the table it adds to. None without a label
    @Input()
    addLabel: string = '';
    @Output()
    add = new EventEmitter<void>();

    stats: FinanceStat[] = toStats({});
    // Average per item of each money total, by its label
    averages: Map<string, number | null | undefined> = new Map();
    showAverage: boolean = false;

    // The parents pass a new, already filled form whenever their data changes, so the stats are built only here
    ngOnChanges(): void {
        let value = this.financeComponentDataForm?.value ?? {};
        this.stats = toStats(value);
        this.averages = new Map(toMoneyStats(this.averageFinanceComponentDataForm?.value ?? {}).map(stat => [stat.label, stat.value]));
        this.showAverage = this.hasAveragedData && (value.count ?? 0) > 1;
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
