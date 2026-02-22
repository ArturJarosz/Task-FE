import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {SupplierForm, SupplierFormProvider} from "../form/supplier-form-provider.service";
import {cloneDeep} from "lodash";
import {SupplierDto} from "../model/supplier";
import {isUndefinedOrEmpty} from "../../shared/utils/data-validation-util";
import {WrapperComponent} from "../../shared";
import {SuppliesListShellComponent} from "../supplies-list-shell/supplies-list-shell.component";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'supplier-detail',
    templateUrl: './supplier-detail.component.html',
    styleUrl: './supplier-detail.component.less',
    standalone: true,
    imports: [WrapperComponent, SuppliesListShellComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, SelectModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class SupplierDetailComponent implements OnChanges {
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
    formInitialized: boolean = false;

    constructor(private formProvider: SupplierFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.formInitialized) {
            this.supplierDetailsForm = this.formProvider.getSupplierForm();
            this.fillFormData();
            this.formInitialized = true;
        }
        if (this.supplier && changes['supplier']) {
            this.fillFormData();
            this.initialSupplierDetailsForm = cloneDeep(this.supplierDetailsForm);
        }
    }

    private fillFormData(): void {
        if (isUndefinedOrEmpty(this.supplier) || !this.supplierDetailsForm) {
            return;
        }
        this.supplierDetailsForm.patchValue({
            name: this.supplier?.name,
            category: this.supplier?.category,
            email: this.supplier?.email,
            telephone: this.supplier?.telephone,
            note: this.supplier?.note
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
