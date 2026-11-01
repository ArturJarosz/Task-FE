import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class ContractorFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getSupplierFormGroup(): FormGroup<ContractorForm> {
        return this.formBuilder.nonNullable.group<ContractorForm>({
            // id of the contractor category as a string, the way configuration entries hold it
            category: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            email: this.formBuilder.control<string>(''),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            note: this.formBuilder.control<string>(''),
            telephone: this.formBuilder.control<string>('')
        })
    }
}

export interface ContractorForm {
    category: FormControl<string>;
    email: FormControl<string | null>;
    name: FormControl<string>;
    note: FormControl<string | null>;
    telephone: FormControl<string | null>;
    id?: FormControl<number>
}
