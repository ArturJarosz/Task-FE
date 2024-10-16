import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {ContractorForm, ContractorFormProvider} from "../form/contractor-form-provider";
import {cloneDeep} from "lodash";
import {ContractorDto} from "../model/contractor";

@Component({
    selector: 'contractor-detail',
    templateUrl: './contractor-detail.component.html',
    styleUrl: './contractor-detail.component.less'
})
export class ContractorDetailComponent implements OnInit, OnChanges {
    @Input()
    contractor!: Contractor | null;
    @Input()
    contractorTypes!: ConfigurationEntry[];
    @Output()
    updateContractorEvent: EventEmitter<Contractor> = new EventEmitter<Contractor>();
    @Output()
    deleteContractorEvent: EventEmitter<ContractorDto> = new EventEmitter<ContractorDto>();

    contractorDetailsForm!: FormGroup<ContractorForm>;
    initialContractorDetailsForm!: FormGroup<ContractorForm>;

    constructor(private formProvider: ContractorFormProvider) {
    }

    ngOnInit(): void {
        this.contractorDetailsForm = this.formProvider.getSupplierFormGroup();
        this.fillFormData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.contractor) {
            this.fillFormData();
            this.initialContractorDetailsForm = cloneDeep(this.contractorDetailsForm);
        }
    }

    private fillFormData(): void {
        if (!this.contractor || !this.contractorDetailsForm) {
            return;
        }
        this.contractorDetailsForm.patchValue({
            name: this.contractor.name,
            category: this.contractor.category,
            email: this.contractor.email,
            telephone: this.contractor.telephone,
            note: this.contractor.note
        })
    }

    isFormChanged(): boolean {
        if (this.contractorDetailsForm.pristine) {
            return false;
        }
        return JSON.stringify(this.contractorDetailsForm.value) !== JSON.stringify(this.initialContractorDetailsForm.value);
    }

    onSave(): void {
        let contractor: Contractor;
        contractor = {
            name: this.contractorDetailsForm.value.name!,
            category: this.contractorDetailsForm.value.category!,
            email: this.contractorDetailsForm.value.email!,
            telephone: this.contractorDetailsForm.value.telephone!,
            note: this.contractorDetailsForm.value.note!
        };
        this.updateContractorEvent.emit(contractor);
    }

    onDelete(): void {
        let contractor: ContractorDto;
        contractor = {
            name: this.contractor?.name!,
            id: this.contractor?.id!
        };
        this.deleteContractorEvent.emit(contractor);
    }
}
