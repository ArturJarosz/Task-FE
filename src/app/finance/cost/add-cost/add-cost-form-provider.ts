import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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
            value: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            date: this.formBuilder.nonNullable.control<Date>(new Date(), [Validators.required]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paid: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            note: this.formBuilder.control('')
        })
    }
}

interface AddCostForm {
    name: FormControl<String>,
    category: FormControl<CostCategory>,
    value: FormControl<number>,
    date: FormControl<Date>,
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    note: FormControl<string | null>
}
