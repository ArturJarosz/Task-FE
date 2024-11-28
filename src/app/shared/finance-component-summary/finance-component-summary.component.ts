import {Component, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {
    FinanceObjectSummaryForm
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";

@Component({
    selector: 'finance-component-summary',
    templateUrl: './finance-component-summary.component.html',
    styleUrl: './finance-component-summary.component.less'
})
export class FinanceComponentSummaryComponent {
    @Input()
    financeComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
    @Input()
    hasAveragedData: boolean = false;
    @Input()
    averageFinanceComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
}
