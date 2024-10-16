import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {SupplierCategory} from "../../generated/models/supplier-category";

const DEFAULT_TYPE = SupplierCategory.FLOORING_SHOP;

@Injectable({
    providedIn: 'root'
})
export class SupplierFormProvider {

    constructor(private formBuilder: FormBuilder) {
    }

    public getSupplierForm(): FormGroup<SupplierForm> {
        return this.formBuilder.nonNullable.group<SupplierForm>({
            category: this.formBuilder.nonNullable.control<SupplierCategory>(DEFAULT_TYPE, [Validators.required]),
            email: this.formBuilder.control<string>(''),
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            note: this.formBuilder.control<string>(''),
            telephone: this.formBuilder.control<string>('')
        })
    }
}

export interface SupplierForm {
    category: FormControl<SupplierCategory>;
    email: FormControl<string | null>;
    name: FormControl<string>;
    note: FormControl<string | null>;
    telephone: FormControl<string | null>;
    id?: FormControl<number>
}
