import {Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {AbstractAddEditComponent} from "../../../shared";
import {SupplierStore} from "../../../supplier/state";
import {Supplier} from "../../../generated/models/supplier";
import {AddSupplyForm, SupplyFormProvider} from "../form";
import {FormGroup} from "@angular/forms";
import {SupplyStore} from "../state/supply.state";
import {Supply} from "../../../generated/models/supply";

@Component({
    selector: 'add-supply',
    templateUrl: './add-supply.component.html',
    styleUrl: './add-supply.component.less'
})
export class AddSupplyComponent implements OnInit, AbstractAddEditComponent {
    @Input()
    visible = false;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new Supply";

    readonly supplierStore = inject(SupplierStore);
    readonly supplyStore = inject(SupplyStore);

    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers;

    addSupplyForm!: FormGroup<AddSupplyForm>;

    constructor(private formProvider: SupplyFormProvider) {
    }

    ngOnInit(): void {
        this.supplierStore.loadSuppliers({});
        this.addSupplyForm = this.formProvider.getAddSupplyForm();
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onSave(): void {
        this.visible = false;
        let supply: Supply = this.createSupply();
        this.supplyStore.createSupply({supply: supply});
    }

    private createSupply(): Supply {
        let supply: Supply;
        supply = {
            name: this.addSupplyForm.value.name,
            paid: this.addSupplyForm.value.paid,
            supplierId: this.addSupplyForm.value.supplierId,
            value: this.addSupplyForm.value.value,
            hasInvoice: this.addSupplyForm.value.hasInvoice,
            note: this.addSupplyForm.value.note,
            payable: true
        }
        return supply;
    }

    isSaveEnabled(): boolean {
        return this.addSupplyForm.valid;
    }

    private resetFields(): void {
        this.addSupplyForm = this.formProvider.getAddSupplyForm();
    }
}
