import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Installment} from "../../../generated/models/installment";
import {FormGroup} from '@angular/forms';
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";
import {cloneDeep} from "lodash";

@Component({
    selector: 'installment-detail',
    templateUrl: './installment-detail.component.html',
    styleUrl: './installment-detail.component.less'
})
export class InstallmentDetailComponent implements OnInit, OnChanges {
    @Input()
    installment!: Installment | null;
    @Output()
    updateInstallmentEvent: EventEmitter<Installment> = new EventEmitter<Installment>();

    initialInstallmentDetailForm!: FormGroup<InstallmentForm>;
    installmentDetailForm!: FormGroup<InstallmentForm>;

    constructor(private installmentFormProvider: InstallmentFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.installment && this.installmentDetailForm) {
            this.fillFormData();
            this.initialInstallmentDetailForm = cloneDeep(this.installmentDetailForm);
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

    isFormChanged(): boolean {
        if (this.installmentDetailForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialInstallmentDetailForm.value) !== JSON.stringify(this.installmentDetailForm.value);
    }

    onSave(): void {
        let installment: Installment;
        installment = {
            stageName: this.installmentDetailForm.value.stageName,
            paid: this.installmentDetailForm.value.paid,
            value: this.installmentDetailForm.value.value,
            hasInvoice: this.installmentDetailForm.value.hasInvoice,
        }
        this.updateInstallmentEvent.emit(installment);
    }

}
