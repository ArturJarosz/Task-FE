import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ContractorJobFormProvider {
    constructor(private formBuilder: FormBuilder) {
    }

    public getAddContractorJobForm(): FormGroup<AddContractorJobForm> {
        return this.formBuilder.nonNullable.group<AddContractorJobForm>({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            value: this.formBuilder.nonNullable.control<number>(0.0, [Validators.required]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            paid: this.formBuilder.nonNullable.control<boolean>(false, [Validators.required]),
            note: this.formBuilder.nonNullable.control<string>(''),
            contractorId: this.formBuilder.nonNullable.control<number>(0)
        })
    }
}

export interface AddContractorJobForm {
    name: FormControl<string>;
    note: FormControl<string>;
    value: FormControl<number>;
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    contractorId: FormControl<number>
}
