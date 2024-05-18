import {ContractorCategory} from "../../generated/models";
import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

const DEFAULT_TYPE = ContractorCategory.GENERAL;

@Injectable({
    providedIn: 'root'
})
export class ContractorFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getSupplierFormGroup(): FormGroup<ContractorForm> {
        return this.formBuilder.nonNullable.group<ContractorForm>({
            category: this.formBuilder.nonNullable.control<ContractorCategory>(DEFAULT_TYPE, [Validators.required]),
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
