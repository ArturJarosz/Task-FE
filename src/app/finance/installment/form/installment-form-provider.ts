import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class InstallmentFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getAddInstallmentForm(): FormGroup<InstallmentForm> {
        return this.formBuilder.nonNullable.group<InstallmentForm>({
            value: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            stageId: this.formBuilder.nonNullable.control<number>(0, []),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            note: this.formBuilder.control<string>(''),
            paid: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paymentDate: this.formBuilder.control<Date | null>(new Date(), [])
        })
    }
}

export interface InstallmentForm {
    value: FormControl<number>,
    stageId: FormControl<number>,
    hasInvoice: FormControl<boolean>,
    note: FormControl<string | null>
    paid: FormControl<boolean>,
    paymentDate: FormControl<Date | null>,
}
