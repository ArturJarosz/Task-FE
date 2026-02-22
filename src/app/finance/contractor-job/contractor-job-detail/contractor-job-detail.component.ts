import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ContractorJob} from "../../../generated/models/contractor-job";
import {Contractor} from "../../../generated/models/contractor";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ContractorJobDetailForm, ContractorJobFormProvider} from "../form/contractor-job-form-provider";
import {cloneDeep} from "lodash";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
import {WrapperComponent} from "../../../shared/wrapper/wrapper.component";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'contractor-job-detail',
    templateUrl: './contractor-job-detail.component.html',
    styleUrl: './contractor-job-detail.component.less',
    standalone: true,
    imports: [WrapperComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
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
        this.contractorJobDetailForm.valueChanges.subscribe(() => {
            if (this.contractorJobDetailForm.value.paid && this.contractorJobDetailForm.controls.paymentDate.disabled) {
                this.contractorJobDetailForm.controls.paymentDate.enable();
            } else if (!this.contractorJobDetailForm.value.paid && this.contractorJobDetailForm.controls.paymentDate.enabled) {
                this.contractorJobDetailForm.controls.paymentDate.disable();
            }
        });
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
            paymentDate: toDateIfExists(this.contractorJob.paymentDate),
            note: this.contractorJob.note,
            contractorId: this.contractorJob.contractorId
        })
        if (this.contractorJob.paid) {
            this.contractorJobDetailForm.controls.paymentDate.enable();
        } else {
            this.contractorJobDetailForm.controls.paymentDate.disable();
        }
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
            paymentDate: this.contractorJobDetailForm.value.paid ? toTimeZoneString(this.contractorJobDetailForm.controls.paymentDate.value!) : undefined,
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
