import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ProjectFinancialSummaryFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getProjectFinancialSummaryForm(): FormGroup<ProjectFinancialSummaryForm> {
        return this.formBuilder.nonNullable.group<ProjectFinancialSummaryForm>({
            grossValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            netValue: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            incomeTax: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
            vatTax: this.formBuilder.nonNullable.control<number>(0, [Validators.required]),
        })
    }
}

export interface ProjectFinancialSummaryForm {
    grossValue: FormControl<number>,
    netValue: FormControl<number>,
    incomeTax: FormControl<number>,
    vatTax: FormControl<number>,
}
