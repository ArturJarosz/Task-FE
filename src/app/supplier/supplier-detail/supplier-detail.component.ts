import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {SupplierForm, SupplierFormProvider} from "../form/supplier-form-provider.service";

@Component({
    selector: 'supplier-detail',
    templateUrl: './supplier-detail.component.html',
    styleUrl: './supplier-detail.component.less'
})
export class SupplierDetailComponent implements OnInit, OnChanges {
    @Input()
    supplier!: Supplier | null;
    @Input()
    supplierTypes!: ConfigurationEntry[];

    supplierDetailsForm!: FormGroup<SupplierForm>;

    constructor(private formProvider: SupplierFormProvider) {
    }

    ngOnInit(): void {
        this.supplierDetailsForm = this.formProvider.getSupplierForm();
        this.fillFormData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.supplier) {
            this.fillFormData();
        }
    }

    private fillFormData(): void {
        if (!this.supplier || !this.supplierDetailsForm) {
            return;
        }
        this.supplierDetailsForm.patchValue({
            name: this.supplier.name,
            category: this.supplier.category,
            email: this.supplier.email,
            telephone: this.supplier.telephone,
            note: this.supplier.note
        })
    }
}
