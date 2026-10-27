import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {AbstractAddEditComponent} from "../../../shared";
import {SupplierStore} from "../../../supplier/state";
import {Supplier} from "../../../generated/models/supplier";
import {AddSupplyForm, SupplyFormProvider} from "../form";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {SupplyStore} from "../state/supply.state";
import {Supply} from "../../../generated/models/supply";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {isControlInvalid, isPaymentDateMissing} from "../../../shared/utils/form-utils";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-supply',
    templateUrl: './add-supply.component.html',
    styleUrl: './add-supply.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class AddSupplyComponent implements OnInit, AbstractAddEditComponent {
    @Input()
    visible = false;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "New supply";

    readonly supplierStore = inject(SupplierStore);
    readonly supplyStore = inject(SupplyStore);

    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers;

    addSupplyForm!: FormGroup<AddSupplyForm>;

    constructor(private formProvider: SupplyFormProvider) {
    }

    ngOnInit(): void {
        this.supplierStore.loadSuppliers({});
        this.resetFields();
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
        this.supplyStore.createSupply({supply: this.createSupply()});
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.addSupplyForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.addSupplyForm);
    }

    isSaveEnabled(): boolean {
        return this.addSupplyForm.valid;
    }

    private createSupply(): Supply {
        const value = this.addSupplyForm.getRawValue();
        return {
            name: value.name,
            paid: value.paid,
            supplierId: value.supplierId ?? undefined,
            value: value.value ?? 0,
            hasInvoice: value.hasInvoice,
            note: value.note,
            // A payment date only makes sense once the supply is paid
            paymentDate: value.paid && value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined,
            payable: true
        };
    }

    private resetFields(): void {
        this.addSupplyForm = this.formProvider.getAddSupplyForm();
    }
}
