import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ConfigurationState, getSupplierTypeConfiguration, loadConfiguration} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";
import {AddSupplierFormProvider} from "./add-supplier-form-provider";
import {Subscription} from "rxjs";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Supplier} from "../../generated/models/supplier";
import {createSupplier, SupplierState} from "../state";

@Component({
    selector: 'app-add-supplier',
    templateUrl: './add-supplier.component.html',
    styleUrl: './add-supplier.component.less'
})
export class AddSupplierComponent implements OnInit, OnDestroy {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new supplier";

    supplierCategoriesSubscription$!: Subscription;
    supplierCategories: ConfigurationEntry[] = [];

    addSupplierForm!: FormGroup;

    constructor(private configurationStore: Store<ConfigurationState>,
                private supplierProvider: AddSupplierFormProvider, private supplierStore: Store<SupplierState>) {
    }

    ngOnInit(): void {
        this.configurationStore.dispatch(loadConfiguration());
        this.addSupplierForm = this.supplierProvider.getAddSupplierFormGroup();
        this.supplierCategoriesSubscription$ = this.configurationStore.select(getSupplierTypeConfiguration)
            .subscribe({
                next: categories => this.supplierCategories = categories
            })
    }

    ngOnDestroy(): void {
        this.supplierCategoriesSubscription$.unsubscribe();
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
        this.supplierStore.dispatch(createSupplier({supplier: supplier}));
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
