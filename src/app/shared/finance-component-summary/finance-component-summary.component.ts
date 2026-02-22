import {Component, Input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
    FinanceObjectSummaryForm
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";

import {NgIf, CurrencyPipe} from "@angular/common";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";

@Component({
    selector: 'finance-component-summary',
    templateUrl: './finance-component-summary.component.html',
    styleUrl: './finance-component-summary.component.less',
    standalone: true,
    imports: [NgIf, CurrencyPipe, Accordion, AccordionPanel, AccordionHeader, AccordionContent, ReactiveFormsModule]
})
export class FinanceComponentSummaryComponent {
    @Input()
    financeComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
    @Input()
    hasAveragedData: boolean = false;
    @Input()
    averageFinanceComponentDataForm!: FormGroup<FinanceObjectSummaryForm>;
}
