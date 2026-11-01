import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output} from '@angular/core';
import {InstallmentStore} from "../state/installment.state";
import {AbstractAddEditComponent} from "../../../shared";
import {Stage} from "../../../generated/models/stage";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";
import {Installment} from "../../../generated/models/installment";
import {InstallmentType} from "../../../generated/models/installment-type";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {InstallmentPaymentFieldsComponent} from "../installment-payment-fields/installment-payment-fields.component";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {Textarea} from "primeng/textarea";
import {ButtonModule} from "primeng/button";

// Adds the installment of a stage. The deposit is added when the contract is signed
@Component({
    selector: 'add-installment',
    templateUrl: './add-installment.component.html',
    styleUrl: './add-installment.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, Textarea, ButtonModule, ReactiveFormsModule, InstallmentPaymentFieldsComponent]
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

    isSaveEnabled(): boolean {
        return this.addInstallmentForm.valid && this.isAvailableStage(this.addInstallmentForm.controls.stageId.value);
    }

    private createInstallment(): Installment {
        const value = this.addInstallmentForm.getRawValue();
        return {
            type: InstallmentType.STAGE,
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
        this.addInstallmentForm = this.addInstallmentFormProvider.getNewInstallmentForm();
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
