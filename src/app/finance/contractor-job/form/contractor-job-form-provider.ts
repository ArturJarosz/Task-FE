import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";
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
            value: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
            hasInvoice: this.formBuilder.nonNullable.control<boolean>(false),
            paid: this.formBuilder.nonNullable.control<boolean>(false),
            paymentDate: this.formBuilder.control<Date | null>(null),
            note: this.formBuilder.nonNullable.control<string>(''),
            contractorId: this.formBuilder.control<number | null>(null, [Validators.required])
        }, {validators: paymentDateRequiredWhenPaid})
    }
}

export interface AddContractorJobForm {
    name: FormControl<string>;
    note: FormControl<string>;
    value: FormControl<number | null>;
    hasInvoice: FormControl<boolean>,
    paid: FormControl<boolean>,
    paymentDate: FormControl<Date | null>,
    contractorId: FormControl<number | null>
}
