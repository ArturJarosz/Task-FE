import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Installment} from "../../../generated/models/installment";
import {FormGroup} from '@angular/forms';
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";

@Component({
    selector: 'installment-detail',
    templateUrl: './installment-detail.component.html',
    styleUrl: './installment-detail.component.less'
})
export class InstallmentDetailComponent implements OnInit, OnChanges {
    @Input()
    installment!: Installment | null;

    installmentDetailForm!: FormGroup<InstallmentForm>;

    constructor(private installmentFormProvider: InstallmentFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.installment && this.installmentDetailForm) {
            this.fillFormData();
        }
    }

    ngOnInit(): void {
        this.installmentDetailForm = this.installmentFormProvider.getInstallmentForm();
        this.fillFormData();
    }

    private fillFormData(): void {
        if (!this.installment) {
            return;
        }
        this.installmentDetailForm.patchValue({
            stageName: this.installment.stageName,
            paid: this.installment.paid,
            value: this.installment.value,
            hasInvoice: this.installment.hasInvoice,
        })
    }

}
