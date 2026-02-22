import {Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ConfigurationStore} from "../../shared/configuration/state";
import {SupplierFormProvider} from "../form/supplier-form-provider.service";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Supplier} from "../../generated/models/supplier";
import {SupplierStore} from "../state";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";
import {NgClass} from "@angular/common";

@Component({
    selector: 'add-supplier',
    templateUrl: './add-supplier.component.html',
    styleUrl: './add-supplier.component.less',
    standalone: true,
    imports: [DialogModule, SelectModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule, NgClass]
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

    constructor(private supplierProvider: SupplierFormProvider) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addSupplierForm = this.supplierProvider.getSupplierForm();
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
    }

    private resetFields() {
        this.addSupplierForm = this.supplierProvider.getSupplierForm();
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
