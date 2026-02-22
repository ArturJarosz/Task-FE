import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, Signal, SimpleChanges} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ContractorFormProvider} from "../form/contractor-form-provider";
import {Contractor} from "../../generated/models/contractor";
import {ContractorStore} from "../state";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";
import {NgClass} from "@angular/common";

@Component({
    selector: 'add-contractor',
    templateUrl: './add-contractor.component.html',
    styleUrl: './add-contractor.component.less',
    standalone: true,
    imports: [DialogModule, SelectModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule, NgClass]
})
export class AddContractorComponent implements OnInit, OnChanges {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add new contractor";

    readonly contractorStore = inject(ContractorStore);
    readonly configurationStore = inject(ConfigurationStore);
    $contractorTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractorTypes;

    addContractorForm!: FormGroup;

    constructor(private contractorFormProvider: ContractorFormProvider) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.addContractorForm = this.contractorFormProvider.getSupplierFormGroup();

    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
    }

    private resetFields() {
        this.addContractorForm = this.contractorFormProvider.getSupplierFormGroup();
    }

    onCancel() {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onSave() {
        this.visible = false;
        let contractor = this.createContractor();
        this.contractorStore.createContractor({contractor: contractor});
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
        this.addContractorForm = this.contractorFormProvider.getSupplierFormGroup();
    }

}
