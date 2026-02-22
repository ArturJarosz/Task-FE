import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {InstallmentStore} from "../state/installment.state";
import {AbstractAddEditComponent} from "../../../shared";
import {Stage} from "../../../generated/models/stage";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";
import {Installment} from "../../../generated/models/installment";
import {toTimeZoneString} from "../../../shared/utils/date-utils";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {Textarea} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'add-installment',
    templateUrl: './add-installment.component.html',
    styleUrl: './add-installment.component.less',
    standalone: true,
    imports: [DialogModule, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, Textarea, ButtonModule, ReactiveFormsModule]
})
export class AddInstallmentComponent implements OnInit, AbstractAddEditComponent, OnChanges {
    @Input()
    visible = false;
    @Input()
    stages!: Array<Stage>;
    @Input()
    stagesWithoutInstallmentIds!: Array<number>;

    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly installmentStore = inject(InstallmentStore);
    header: string = "Add new Installment";

    addInstallmentForm!: FormGroup<InstallmentForm>;
    stagesWithoutInstallment!: Array<Stage>;


    constructor(private addInstallmentFormProvider: InstallmentFormProvider) {
    }

    ngOnInit(): void {
        this.addInstallmentForm = this.addInstallmentFormProvider.getInstallmentForm();
        this.addInstallmentForm.valueChanges.subscribe(form => {
            if (this.addInstallmentForm.value.paid && this.addInstallmentForm.controls.paymentDate.disabled) {
                this.addInstallmentForm.controls.paymentDate.enable()
            } else if (!this.addInstallmentForm.value.paid && this.addInstallmentForm.controls.paymentDate.enabled) {
                this.addInstallmentForm.controls.paymentDate.disable()
            }
        })
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.stagesWithoutInstallmentIds) {
            this.stagesWithoutInstallment = this.stages.filter(
                stage => this.stagesWithoutInstallmentIds.includes(stage.id!)
            );
            if (this.addInstallmentForm && this.stagesWithoutInstallment.length > 0) {
                this.addInstallmentForm.patchValue({stageId: this.stagesWithoutInstallment[0].id});
            }
        }
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
        let installment: Installment = this.createInstallment();
        this.installmentStore.createInstallment({installment: installment});
    }

    isSaveEnabled(): boolean {
        return this.addInstallmentForm.valid;
    }

    private createInstallment(): Installment {
        let installment: Installment;
        installment = {
            value: this.addInstallmentForm.value.value,
            stageId: this.addInstallmentForm.value.stageId,
            hasInvoice: this.addInstallmentForm.value.hasInvoice,
            paid: this.addInstallmentForm.value.paid,
            paymentDate: this.addInstallmentForm.value.paid? toTimeZoneString(this.addInstallmentForm.value.paymentDate!) : undefined,
            note: this.addInstallmentForm.value.note!,
        }
        return installment;
    }

    private resetFields(): void {
        this.addInstallmentForm = this.addInstallmentFormProvider.getInstallmentForm();
    }
}
