import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {FormGroup} from "@angular/forms";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {Stage} from "../../../generated/models/stage";

@Component({
    selector: 'installment-list',
    templateUrl: './installment-list.component.html',
    styleUrl: './installment-list.component.less'
})
export class InstallmentListComponent implements OnChanges {
    @Input()
    installmentProjectData!: InstallmentProjectData;

    installmentsDetailForm!: FormGroup<FinanceObjectSummaryForm>;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.installmentsDetailForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['installmentProjectData'] && this.installmentProjectData) {
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
