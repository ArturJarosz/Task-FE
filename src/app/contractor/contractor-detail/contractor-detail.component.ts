import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {ContractorForm, ContractorFormProvider} from "../form/contractor-form-provider";

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

    contractorDetailsForm!: FormGroup<ContractorForm>;

    constructor(private formProvider: ContractorFormProvider) {
    }

    ngOnInit(): void {
        this.contractorDetailsForm = this.formProvider.getSupplierFormGroup();
        this.fillFormData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.contractor) {
            this.fillFormData();
        }
    }

    private fillFormData() {
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
}
