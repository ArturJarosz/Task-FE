import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AddSupervisionVisitFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getAddSupervisionVisitForm(): FormGroup<AddSupervisionVisitForm> {
        return this.formBuilder.nonNullable.group<AddSupervisionVisitForm>({
            dateOfVisit: this.formBuilder.control<Date | null>(null, [Validators.required]),
            hoursCount: this.formBuilder.control<number | null>(0, [Validators.required, Validators.min(0)]),
            payable: this.formBuilder.nonNullable.control<boolean>(true)
        })
    }
}

export interface AddSupervisionVisitForm {
    dateOfVisit: FormControl<Date | null>,
    hoursCount: FormControl<number | null>,
    payable: FormControl<boolean>
}
