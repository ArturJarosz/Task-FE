import {Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {ContractorJobStore} from "../state/contractor-job.state";
import {ContractorStore} from "../../../contractor/state";
import {Contractor} from "../../../generated/models/contractor";
import {AddContractorJobForm, ContractorJobFormProvider} from "../form/contractor-job-form-provider";
import {FormGroup} from "@angular/forms";
import {AbstractAddEditComponent} from "../../../shared";
import {ContractorJob} from "../../../generated/models/contractor-job";
import {toTimeZoneString} from "../../../shared/utils/date-utils";

@Component({
    selector: 'add-contractor-job',
    templateUrl: './add-contractor-job.component.html',
    styleUrl: './add-contractor-job.component.less'
})
export class AddContractorJobComponent implements OnInit, AbstractAddEditComponent {

    @Input()
    visible: boolean = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "Add Contractor Job";

    readonly contractorJobStore = inject(ContractorJobStore);
    readonly contractorStore = inject(ContractorStore);

    $contractors: Signal<Contractor[]> = this.contractorStore.contractors!;

    addContractorJobForm!: FormGroup<AddContractorJobForm>;

    constructor(private formProvider: ContractorJobFormProvider) {
    }

    ngOnInit(): void {
        this.contractorStore.loadContractors({});
        this.addContractorJobForm = this.formProvider.getAddContractorJobForm();
        this.addContractorJobForm.valueChanges.subscribe(() => {
            if (this.addContractorJobForm.value.paid && this.addContractorJobForm.controls.paymentDate.disabled) {
                this.addContractorJobForm.controls.paymentDate.enable();
            } else if (!this.addContractorJobForm.value.paid && this.addContractorJobForm.controls.paymentDate.enabled) {
                this.addContractorJobForm.controls.paymentDate.disable();
            }
        });
    }

    onCancel(): void {
        this.visible = false;
        this.resetFields();
    }

    onClose(): void {
        this.resetFields();
        this.notify.emit(false);
        this.visible = false;
    }

    onSave(): void {
        this.visible = false;
        let contractorJob: ContractorJob = this.createContractorJob();
        this.contractorJobStore.createContractorJob({contractorJob});
    }

    isSaveEnabled(): boolean {
        return this.addContractorJobForm.valid;
    }

    private resetFields(): void {
        this.addContractorJobForm.reset();
    }

    private createContractorJob(): ContractorJob {
        let contractorJob: ContractorJob;
        contractorJob = {
            name: this.addContractorJobForm.value.name,
            paid: this.addContractorJobForm.value.paid,
            contractorId: this.addContractorJobForm.value.contractorId,
            value: this.addContractorJobForm.value.value,
            hasInvoice: this.addContractorJobForm.value.hasInvoice,
            note: this.addContractorJobForm.value.note,
            paymentDate: this.addContractorJobForm.value.paid ? toTimeZoneString(this.addContractorJobForm.controls.paymentDate.value!) : undefined,
            payable: true
        }
        return contractorJob;
    }

}
