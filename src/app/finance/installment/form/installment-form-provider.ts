import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable({
    providedIn: "root",
})
export class InstallmentFormProvider {
    constructor(private formBuilder: FormBuilder) {

    }

    public getInstallmentsDetail(): FormGroup<InstallmentsForm> {
        return this.formBuilder.nonNullable.group({
            count: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            paid: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            grossValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            netValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            incomeTax: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            vatTax: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
        })
    }
}

export interface InstallmentsForm {
    count: FormControl<number>,
    paid: FormControl<number>,
    grossValue: FormControl<number>,
    netValue: FormControl<number>,
    incomeTax: FormControl<number>,
    vatTax: FormControl<number>,

}
