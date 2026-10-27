import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";

@Injectable({
    providedIn: 'root'
})
export class SupplyFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getAddSupplyForm(): FormGroup<AddSupplyForm> {
        return this.formBuilder.nonNullable.group<AddSupplyForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            value: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false),
            paid: this.formBuilder.nonNullable.control<boolean>(false),
            paymentDate: this.formBuilder.control<Date | null>(null),
            note: this.formBuilder.nonNullable.control<string>(''),
            supplierId: this.formBuilder.control<number | null>(null, [Validators.required])
        }, {validators: paymentDateRequiredWhenPaid})
    }
}

export interface AddSupplyForm {
    name: FormControl<string>,
    note: FormControl<string>,
    value: FormControl<number | null>,
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    paymentDate: FormControl<Date | null>,
    supplierId: FormControl<number | null>
}
