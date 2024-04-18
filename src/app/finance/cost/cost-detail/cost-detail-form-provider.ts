import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {CostCategory} from "../../../generated/models/cost-category";

@Injectable({
    providedIn: 'root'
})
export class CostDetailFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getCostDetailForm(): FormGroup<CostForm> {
        return this.formBuilder.nonNullable.group<CostForm>({
            id: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            date: this.formBuilder.nonNullable.control<Date>(new Date(), [Validators.required]),
            category: this.formBuilder.nonNullable.control<CostCategory>(CostCategory.FUEL, [Validators.required]),
            value: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            note: this.formBuilder.control<string>(''),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(true, [Validators.required]),
            payable: this.formBuilder.nonNullable.control<boolean>(true, [Validators.required]),
            paid: this.formBuilder.nonNullable.control<boolean>(true, [Validators.required])
        })
    }
}

export interface CostForm {
    id: FormControl<number>,
    name: FormControl<string>,
    date: FormControl<Date>,
    category: FormControl<CostCategory>,
    value: FormControl<number>,
    note: FormControl<string | null>,
    hasInvoice: FormControl<boolean>,
    payable: FormControl<boolean>,
    paid: FormControl<boolean>

}
