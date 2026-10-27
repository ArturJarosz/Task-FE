import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SupervisionVisitFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getSupervisionVisitForm(): FormGroup<SupervisionVisitForm> {
        return this.formBuilder.nonNullable.group<SupervisionVisitForm>({
            dateOfVisit: this.formBuilder.control<Date | null>(null, [Validators.required]),
            hoursCount: this.formBuilder.control<number | null>(0, [Validators.required, Validators.min(0)]),
            payable: this.formBuilder.nonNullable.control<boolean>(false)
        })
    }
}

export interface SupervisionVisitForm {
    dateOfVisit: FormControl<Date | null>,
    hoursCount: FormControl<number | null>,
    payable: FormControl<boolean>
}
