import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class SupplyFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getAddSupplyForm(): FormGroup<AddSupplyForm> {
        return this.formBuilder.nonNullable.group<AddSupplyForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            value: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            date: this.formBuilder.nonNullable.control<Date>(new Date(), [Validators.required]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paid: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            note: this.formBuilder.nonNullable.control<string>(''),
            supplierId: this.formBuilder.nonNullable.control<number>(0)
        })
    }
}

export interface AddSupplyForm {
    name: FormControl<string>,
    note: FormControl<string>,
    value: FormControl<number>,
    date: FormControl<Date>,
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    supplierId: FormControl<number>
}
