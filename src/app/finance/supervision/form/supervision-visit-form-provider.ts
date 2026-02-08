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
            dateOfVisit: this.formBuilder.nonNullable.control<Date>(new Date(), [Validators.required]),
            hoursCount: this.formBuilder.nonNullable.control<number>(0, [Validators.required, Validators.min(0)]),
            payable: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required])
        })
    }
}

export interface SupervisionVisitForm {
    dateOfVisit: FormControl<Date>,
    hoursCount: FormControl<number>,
    payable: FormControl<boolean>
}
