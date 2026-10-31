import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {paymentDateRequiredWhenPaid} from "../../shared/utils/form-utils";

@Injectable({
    providedIn: 'root'
})
export class FinancialItemDetailFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getFinancialItemDetailForm(): FormGroup<FinancialItemDetailForm> {
        return this.formBuilder.nonNullable.group<FinancialItemDetailForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            value: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required, Validators.min(0.01)]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paid: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paymentDate: this.formBuilder.control<Date | null>({value: null, disabled: true}),
            note: this.formBuilder.nonNullable.control<string>(''),
            partnerId: this.formBuilder.control<number | null>(null, [Validators.required])
        }, {validators: paymentDateRequiredWhenPaid})
    }
}

export interface FinancialItemDetailForm {
    name: FormControl<string>;
    value: FormControl<number>;
    hasInvoice: FormControl<boolean>;
    paid: FormControl<boolean>;
    paymentDate: FormControl<Date | null>;
    note: FormControl<string>;
    partnerId: FormControl<number | null>;
}
