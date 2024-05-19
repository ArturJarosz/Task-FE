import {Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ConfigurationStore} from "../../shared/configuration/state";
import {AddSupplierFormProvider} from "./add-supplier-form-provider";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Supplier} from "../../generated/models/supplier";
import {SupplierStore} from "../state";

@Component({
    selector: 'add-supplier',
    templateUrl: './add-supplier.component.html',
    styleUrl: './add-supplier.component.less'
})
export class AddSupplierComponent implements OnInit {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new supplier";

    readonly supplierStore = inject(SupplierStore);
    readonly configurationStore = inject(ConfigurationStore);
    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;

    addSupplierForm!: FormGroup;

    constructor(private supplierProvider: AddSupplierFormProvider) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addSupplierForm = this.supplierProvider.getAddSupplierFormGroup();
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
    }

    private resetFields() {
        this.addSupplierForm = this.supplierProvider.getAddSupplierFormGroup();
    }

    onCancel() {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onSave() {
        this.visible = false;
        let supplier = this.createSupplier();
        this.supplierStore.createSupplier({supplier});
    }

    isSaveEnabled() {
        return this.addSupplierForm.valid;
    }

    private createSupplier(): Supplier {
        let supplier: Supplier;
        supplier = {
            name: this.addSupplierForm.get('name')?.value,
            category: this.addSupplierForm.get('category')?.value,
            email: this.addSupplierForm.get('email')?.value,
            telephone: this.addSupplierForm.get('telephone')?.value,
            note: this.addSupplierForm.get('note')?.value
        }
        return supplier;
    }
}
