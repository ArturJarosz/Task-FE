import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, Signal, SimpleChanges} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Store} from "@ngrx/store";
import {AddContractorFormProvider} from "./add-contractor-form-provider";
import {ContractorState, createContractor} from "../state";
import {Contractor} from "../../generated/models/contractor";

@Component({
    selector: 'add-contractor',
    templateUrl: './add-contractor.component.html',
    styleUrl: './add-contractor.component.less'
})
export class AddContractorComponent implements OnInit, OnChanges {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new contractor";

    readonly configurationStore = inject(ConfigurationStore);
    $contractorTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractorTypes;

    addContractorForm!: FormGroup;

    constructor(private contractorFormProvider: AddContractorFormProvider,
                private contractorStore: Store<ContractorState>) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addContractorForm = this.contractorFormProvider.getAddSupplierFormGroup();

    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
    }

    private resetFields() {
        this.addContractorForm = this.contractorFormProvider.getAddSupplierFormGroup();
    }

    onCancel() {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onSave() {
        this.visible = false;
        let contractor = this.createContractor();
        this.contractorStore.dispatch(createContractor({contractor: contractor}));
    }

    isSaveEnabled() {
        return this.addContractorForm.valid;
    }

    private createContractor(): Contractor {
        let contractor: Contractor;
        contractor = {
            name: this.addContractorForm.get('name')?.value,
            category: this.addContractorForm.get('category')?.value,
            email: this.addContractorForm.get('email')?.value,
            telephone: this.addContractorForm.get('telephone')?.value,
            note: this.addContractorForm.get('note')?.value
        }
        return contractor;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.addContractorForm = this.contractorFormProvider.getAddSupplierFormGroup();
    }

}
