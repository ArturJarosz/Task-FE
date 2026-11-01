import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FinanceComponentSummaryComponent} from "../../../shared/finance-component-summary/finance-component-summary.component";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {EmptyStateComponent, NotSetComponent, YesNoMarkComponent} from "../../../shared";
import {Installment} from "../../../generated/models/installment";
import {isDeposit} from "../installment-utils";

@Component({
    selector: 'installment-list',
    templateUrl: './installment-list.component.html',
    styleUrl: './installment-list.component.less',
    standalone: true,
    imports: [FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe, DatePipe, EmptyStateComponent, NotSetComponent, YesNoMarkComponent]
})
export class InstallmentListComponent implements OnChanges {
    @Input()
    installmentProjectData!: InstallmentProjectData;
    @Input()
    projectId: number = 0;

    installmentsDetailForm!: FormGroup<FinanceObjectSummaryForm>;
    // The deposit first, as it is paid before any stage
    installments: Installment[] = [];
    protected readonly isDeposit = isDeposit;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.installmentsDetailForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['installmentProjectData'] && this.installmentProjectData) {
            const installments = this.installmentProjectData.installments ?? [];
            this.installments = [...installments.filter(isDeposit), ...installments.filter(installment => !isDeposit(installment))];
            this.fillFormData();
        }
    }

    private fillFormData(): void {
        if (isUndefinedOrEmpty(this.installmentProjectData) || !this.installmentsDetailForm) {
            return;
        }

        let paidCount = this.installmentProjectData.installments!.filter(installment => {
            return installment.paid
        }).length;

        this.installmentsDetailForm.patchValue({
            count: this.installmentProjectData.financialData?.count,
            paid: paidCount,
            netValue: this.installmentProjectData.financialData?.netValue,
            grossValue: this.installmentProjectData.financialData?.grossValue,
            incomeTax: this.installmentProjectData.financialData?.incomeTax,
            vatTax: this.installmentProjectData.financialData?.vatTax,
        })
    }
}
