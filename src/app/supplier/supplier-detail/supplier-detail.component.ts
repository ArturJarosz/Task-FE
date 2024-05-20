import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {SupplierForm, SupplierFormProvider} from "../form/supplier-form-provider.service";
import {cloneDeep} from "lodash";
import {SupplierDto} from "../model/supplier";

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
    @Output()
    updateSupplierEvent: EventEmitter<Supplier> = new EventEmitter<Supplier>();
    @Output()
    deleteSupplierEvent: EventEmitter<SupplierDto> = new EventEmitter<SupplierDto>();

    supplierDetailsForm!: FormGroup<SupplierForm>;
    initialSupplierDetailsForm!: FormGroup<SupplierForm>;

    constructor(private formProvider: SupplierFormProvider) {
    }

    ngOnInit(): void {
        this.supplierDetailsForm = this.formProvider.getSupplierForm();
        this.fillFormData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.supplier) {
            this.fillFormData();
            this.initialSupplierDetailsForm = cloneDeep(this.supplierDetailsForm);
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

    isFormChanged(): boolean {
        if (this.supplierDetailsForm.pristine) {
            return false;
        }
        return JSON.stringify(this.supplierDetailsForm.value) !== JSON.stringify(this.initialSupplierDetailsForm.value);
    }

    onSave(): void {
        let supplier: Supplier;
        supplier = {
            name: this.supplierDetailsForm.value.name!,
            category: this.supplierDetailsForm.value.category!,
            email: this.supplierDetailsForm.value.email!,
            telephone: this.supplierDetailsForm.value.telephone!,
            note: this.supplierDetailsForm.value.note!
        };
        this.updateSupplierEvent.emit(supplier);
    }

    onDelete(): void {
        let supplier: SupplierDto;
        supplier = {
            name: this.supplier?.name!,
            id: this.supplier?.id!
        };
        this.deleteSupplierEvent.emit(supplier);
    }
}
