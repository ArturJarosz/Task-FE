import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class ArchitectFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getArchitectDetailsForm(): FormGroup<ArchitectDetailsForm> {
        return this.formBuilder.nonNullable.group<ArchitectDetailsForm>({
            firstName: this.formBuilder.control<string>('', [Validators.required]),
            lastName: this.formBuilder.control<string>('', [Validators.required]),
        })
    }

    public getArchitectProjectsSummaryForm(): FormGroup<ArchitectProjectsSummaryForm> {
        return this.formBuilder.group<ArchitectProjectsSummaryForm>({
            count: this.formBuilder.nonNullable.control<number>(0),
            totalValue: this.formBuilder.nonNullable.control<number>(0)
        })
    }

}

export interface ArchitectDetailsForm {
    id?: FormControl<number>,
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
}

export interface ArchitectProjectsSummaryForm {
    count: FormControl<number>,
    totalValue: FormControl<number>
}
