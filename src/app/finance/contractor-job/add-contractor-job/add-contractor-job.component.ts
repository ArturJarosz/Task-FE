import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, Signal} from '@angular/core';
import {ContractorJobStore} from "../state/contractor-job.state";
import {ContractorStore} from "../../../contractor/state";
import {Contractor} from "../../../generated/models/contractor";
import {AddContractorJobForm, ContractorJobFormProvider} from "../form/contractor-job-form-provider";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AbstractAddEditComponent} from "../../../shared";
import {ContractorJob} from "../../../generated/models/contractor-job";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {isControlInvalid, isPaymentDateMissing} from "../../../shared/utils/form-utils";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {Textarea} from "primeng/textarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-contractor-job',
    templateUrl: './add-contractor-job.component.html',
    styleUrl: './add-contractor-job.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class AddContractorJobComponent implements OnInit, AbstractAddEditComponent {

    @Input()
    visible: boolean = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    header: string = "New contractor job";

    readonly contractorJobStore = inject(ContractorJobStore);
    readonly contractorStore = inject(ContractorStore);

    $contractors: Signal<Contractor[]> = this.contractorStore.contractors!;

    addContractorJobForm!: FormGroup<AddContractorJobForm>;

    constructor(private formProvider: ContractorJobFormProvider) {
    }

    ngOnInit(): void {
        this.contractorStore.loadContractors({});
        this.resetFields();
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
        this.contractorJobStore.createContractorJob({contractorJob: this.createContractorJob()});
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.addContractorJobForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.addContractorJobForm);
    }

    isSaveEnabled(): boolean {
        return this.addContractorJobForm.valid;
    }

    private resetFields(): void {
        this.addContractorJobForm = this.formProvider.getAddContractorJobForm();
    }

    private createContractorJob(): ContractorJob {
        const value = this.addContractorJobForm.getRawValue();
        return {
            name: value.name,
            paid: value.paid,
            contractorId: value.contractorId ?? undefined,
            value: value.value ?? 0,
            hasInvoice: value.hasInvoice,
            note: value.note,
            // A payment date only makes sense once the job is paid
            paymentDate: value.paid && value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined,
            payable: true
        };
    }
}
