import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";
import {CostCategory} from "../../../generated/models";

const DEFAULT_COST_CATEGORY = CostCategory.FUEL;

@Injectable({
    providedIn: 'root'
})
export class AddCostFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getAddCostForm(): FormGroup<AddCostForm> {
        return this.formBuilder.nonNullable.group<AddCostForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            category: this.formBuilder.nonNullable.control<CostCategory>(DEFAULT_COST_CATEGORY, [Validators.required]),
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
    category: FormControl<CostCategory>,
    value: FormControl<number | null>,
    date: FormControl<Date>,
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    paymentDate: FormControl<Date | null>,
    note: FormControl<string | null>
}
