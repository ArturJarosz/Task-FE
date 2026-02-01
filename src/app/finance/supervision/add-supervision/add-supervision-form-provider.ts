import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AddSupervisionFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getAddSupervisionForm() {
        return this.formBuilder.nonNullable.group({
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            baseNetValue: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            visitNetRate: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            hourlyNetRate: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            hoursCount: this.formBuilder.control<number>(0),
            visitsCount: this.formBuilder.control<number>(0)
        })
    }
}

export interface AddSupervisionForm {
    hasInvoice: FormControl<boolean>,
    baseNetValue: FormControl<number>,
    visitNetRate: FormControl<number>,
    hourlyNetRate: FormControl<number>
    hoursCount: FormControl<number | null>;
    visitsCount: FormControl<number | null>;
}
