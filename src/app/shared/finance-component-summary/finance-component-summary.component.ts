import {Component, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {
    FinanceObjectSummaryForm
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";

import {NgFor, NgIf, CurrencyPipe} from "@angular/common";

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
    imports: [NgFor, NgIf, CurrencyPipe]
})
export class FinanceComponentSummaryComponent {
    @Input()
    financeComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
    @Input()
    hasAveragedData: boolean = false;
    @Input()
    averageFinanceComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;

    get stats(): FinanceStat[] {
        let value = this.financeComponentDataForm?.value ?? {};
        return [
            {label: 'Count', value: value.count, money: false},
            {label: 'Paid', value: value.paid, money: false},
            ...toMoneyStats(value)
        ];
    }

    get averageStats(): FinanceStat[] {
        return toMoneyStats(this.averageFinanceComponentDataForm?.value ?? {});
    }
}

function toMoneyStats(value: Partial<{ grossValue: number | null, netValue: number | null, incomeTax: number | null, vatTax: number | null }>): FinanceStat[] {
    return [
        {label: 'Gross value', value: value.grossValue, money: true},
        {label: 'Net value', value: value.netValue, money: true},
        {label: 'Income tax', value: value.incomeTax, money: true},
        {label: 'VAT', value: value.vatTax, money: true},
    ];
}
