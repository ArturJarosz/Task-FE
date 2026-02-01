import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AddSupervisionVisitFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getAddSupervisionVisitForm() {
        return this.formBuilder.nonNullable.group({
            dateOfVisit: this.formBuilder.nonNullable.control<Date | null>(null, [Validators.required]),
            hoursCount: this.formBuilder.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
            payable: this.formBuilder.nonNullable.control<boolean>(true, [Validators.required])
        })
    }
}

export interface AddSupervisionVisitForm {
    dateOfVisit: FormControl<Date | null>,
    hoursCount: FormControl<number>,
    payable: FormControl<boolean>
}
