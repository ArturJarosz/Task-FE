import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AddSupervisionFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getAddSupervisionForm(): FormGroup<AddSupervisionForm> {
        return this.formBuilder.nonNullable.group<AddSupervisionForm>({
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false),
            baseNetValue: this.formBuilder.control<number | null>(0.0, [Validators.required, Validators.min(0)]),
            visitNetRate: this.formBuilder.control<number | null>(0.0, [Validators.required, Validators.min(0)]),
            hourlyNetRate: this.formBuilder.control<number | null>(0.0, [Validators.required, Validators.min(0)])
        })
    }
}

export interface AddSupervisionForm {
    hasInvoice: FormControl<boolean>,
    baseNetValue: FormControl<number | null>,
    visitNetRate: FormControl<number | null>,
    hourlyNetRate: FormControl<number | null>
}
