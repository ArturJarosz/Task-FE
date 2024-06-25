import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {InstallmentFormProvider, InstallmentsForm} from "../form/installment-form-provider";
import {FormGroup} from "@angular/forms";

@Component({
    selector: 'installment-list',
    templateUrl: './installment-list.component.html',
    styleUrl: './installment-list.component.less'
})
export class InstallmentListComponent implements OnInit, OnChanges {
    @Input()
    installmentProjectData!: InstallmentProjectData;

    installmentsDetailForm!: FormGroup<InstallmentsForm>;

    constructor(private formProvider: InstallmentFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['installmentProjectData'] && this.installmentProjectData) {
            this.fillFormData();
        }
    }

    ngOnInit(): void {
        this.installmentsDetailForm = this.formProvider.getInstallmentsDetail();
    }

    private fillFormData(): void {
        if (!this.installmentProjectData) {
            return;
        }
        if (!this.installmentsDetailForm) {
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
