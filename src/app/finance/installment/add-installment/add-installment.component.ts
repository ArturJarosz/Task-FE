import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output} from '@angular/core';
import {InstallmentStore} from "../state/installment.state";
import {AbstractAddEditComponent} from "../../../shared";
import {Stage} from "../../../generated/models/stage";
import {FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";
import {Installment} from "../../../generated/models/installment";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {isControlInvalid, isPaymentDateMissing, paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {Textarea} from "primeng/textarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-installment',
    templateUrl: './add-installment.component.html',
    styleUrl: './add-installment.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class AddInstallmentComponent implements OnInit, AbstractAddEditComponent, OnChanges {
    @Input()
    visible = false;
    @Input()
    stages: Array<Stage> = [];
    @Input()
    stagesWithoutInstallmentIds: Array<number> | undefined;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly installmentStore = inject(InstallmentStore);
    header: string = "New installment";

    addInstallmentForm!: FormGroup<InstallmentForm>;
    stagesWithoutInstallment: Array<Stage> = [];

    constructor(private addInstallmentFormProvider: InstallmentFormProvider) {
    }

    ngOnInit(): void {
        this.resetFields();
    }

    ngOnChanges(): void {
        const ids = this.stagesWithoutInstallmentIds ?? [];
        this.stagesWithoutInstallment = (this.stages ?? []).filter(stage => ids.includes(stage.id!));
        this.prefillStage();
    }

    onClose(): void {
        this.resetFields();
        this.visible = false;
        this.notify.emit(false);
    }

    onCancel(): void {
        this.resetFields();
        this.visible = false;
    }

    onSave(): void {
        this.visible = false;
        this.installmentStore.createInstallment({installment: this.createInstallment()});
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.addInstallmentForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.addInstallmentForm);
    }

    isSaveEnabled(): boolean {
        return this.addInstallmentForm.valid && this.isAvailableStage(this.addInstallmentForm.controls.stageId.value);
    }

    private createInstallment(): Installment {
        const value = this.addInstallmentForm.getRawValue();
        return {
            value: value.value,
            stageId: value.stageId,
            hasInvoice: value.hasInvoice,
            paid: value.paid,
            // A payment date only makes sense once the installment is paid
            paymentDate: value.paid && value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined,
            note: value.note ?? undefined,
        };
    }

    private resetFields(): void {
        this.addInstallmentForm = this.addInstallmentFormProvider.getInstallmentForm();
        // The provider is shared with the installment detail page, so the add-only rules are added here
        this.addInstallmentForm.controls.value.addValidators(Validators.min(0.01));
        this.addInstallmentForm.addValidators(paymentDateRequiredWhenPaid);
        this.addInstallmentForm.updateValueAndValidity();
        this.prefillStage();
    }

    // Selects the first stage without an installment unless a valid one is already picked
    private prefillStage(): void {
        if (!this.addInstallmentForm || this.isAvailableStage(this.addInstallmentForm.controls.stageId.value)) {
            return;
        }
        this.addInstallmentForm.patchValue({stageId: this.stagesWithoutInstallment[0]?.id ?? 0});
    }

    private isAvailableStage(stageId: number): boolean {
        return this.stagesWithoutInstallment.some(stage => stage.id === stageId);
    }
}
