import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";

@Injectable({
    providedIn: 'root'
})
export class AddCostFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getAddCostForm(): FormGroup<AddCostForm> {
        return this.formBuilder.nonNullable.group<AddCostForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            // id of the cost category as a string, the way configuration entries hold it
            category: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            value: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
            date: this.formBuilder.nonNullable.control<Date>(new Date(), [Validators.required]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false),
            paid: this.formBuilder.nonNullable.control<boolean>(false),
            paymentDate: this.formBuilder.control<Date | null>(null),
            note: this.formBuilder.control<string>('')
        }, {validators: paymentDateRequiredWhenPaid})
    }
}

export interface AddCostForm {
    name: FormControl<string>,
    category: FormControl<string>,
    value: FormControl<number | null>,
    date: FormControl<Date>,
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    paymentDate: FormControl<Date | null>,
    note: FormControl<string | null>
}
