import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";
import {paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";

@Injectable({
    providedIn: 'root'
})
export class InstallmentFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getInstallmentForm(): FormGroup<InstallmentForm> {
        return this.formBuilder.nonNullable.group<InstallmentForm>({
            value: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            stageId: this.formBuilder.nonNullable.control<number>(0, []),
            stageName: this.formBuilder.nonNullable.control<string>(""),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            note: this.formBuilder.control<string>(''),
            paid: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paymentDate: this.formBuilder.control<Date | null>(new Date(), [])
        })
    }

    // A new installment: a value above 0, and a payment date when it is paid. The detail page edits with the plain form
    public getNewInstallmentForm(): FormGroup<InstallmentForm> {
        const form = this.getInstallmentForm();
        form.controls.value.addValidators(Validators.min(0.01));
        form.addValidators(paymentDateRequiredWhenPaid);
        // Re-checks the value with the added rule; that also re-checks the form
        form.controls.value.updateValueAndValidity();
        return form;
    }
}

export interface InstallmentForm {
    value: FormControl<number>,
    stageId: FormControl<number>,
    stageName: FormControl<string>,
    hasInvoice: FormControl<boolean>,
    note: FormControl<string | null>
    paid: FormControl<boolean>,
    paymentDate: FormControl<Date | null>,
}
