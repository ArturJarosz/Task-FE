import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ContractorJob} from "../../../generated/models/contractor-job";
import {Contractor} from "../../../generated/models/contractor";
import {FormGroup} from '@angular/forms';
import {ContractorJobDetailForm, ContractorJobFormProvider} from "../form/contractor-job-form-provider";
import {cloneDeep} from "lodash";

@Component({
    selector: 'contractor-job-detail',
    templateUrl: './contractor-job-detail.component.html',
    styleUrl: './contractor-job-detail.component.less'
})
export class ContractorJobDetailComponent implements OnInit, OnChanges {
    @Input()
    contractorJob!: ContractorJob | null;

    @Input()
    contractors: Contractor[] = [];

    @Output()
    updateContractorJobEvent: EventEmitter<ContractorJob> = new EventEmitter<ContractorJob>();

    @Output()
    deleteContractorJobEvent: EventEmitter<{ contractorJobId: number, contractorJobName: string }> = new EventEmitter<{ contractorJobId: number, contractorJobName: string }>();

    initialContractorJobDetailForm!: FormGroup<ContractorJobDetailForm>;
    contractorJobDetailForm!: FormGroup<ContractorJobDetailForm>;

    constructor(private contractorJobFormProvider: ContractorJobFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.contractorJob && this.contractorJobDetailForm) {
            this.fillFormData();
            this.initialContractorJobDetailForm = cloneDeep(this.contractorJobDetailForm);
        }
    }

    ngOnInit(): void {
        this.contractorJobDetailForm = this.contractorJobFormProvider.getContractorJobDetailForm();
        this.fillFormData();
        this.initialContractorJobDetailForm = cloneDeep(this.contractorJobDetailForm);
    }

    private fillFormData(): void {
        if (!this.contractorJob) {
            return;
        }
        this.contractorJobDetailForm.patchValue({
            name: this.contractorJob.name,
            value: this.contractorJob.value,
            hasInvoice: this.contractorJob.hasInvoice,
            paid: this.contractorJob.paid,
            note: this.contractorJob.note,
            contractorId: this.contractorJob.contractorId
        })
    }

    isFormChanged(): boolean {
        if (!this.contractorJobDetailForm || !this.initialContractorJobDetailForm) {
            return false;
        }
        if (this.contractorJobDetailForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialContractorJobDetailForm.value) !== JSON.stringify(this.contractorJobDetailForm.value);
    }

    onSave(): void {
        let contractorJob: ContractorJob = {
            id: this.contractorJob?.id,
            projectId: this.contractorJob?.projectId,
            name: this.contractorJobDetailForm.value.name,
            value: this.contractorJobDetailForm.value.value,
            hasInvoice: this.contractorJobDetailForm.value.hasInvoice,
            paid: this.contractorJobDetailForm.value.paid,
            note: this.contractorJobDetailForm.value.note,
            contractorId: this.contractorJobDetailForm.value.contractorId,
            payable: this.contractorJob?.payable
        };
        this.updateContractorJobEvent.emit(contractorJob);
    }

    onDelete(): void {
        if (this.contractorJob?.id && this.contractorJob?.name) {
            this.deleteContractorJobEvent.emit({
                contractorJobId: this.contractorJob.id,
                contractorJobName: this.contractorJob.name
            });
        }
    }
}
