import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Installment} from "../../../generated/models/installment";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";
import {cloneDeep} from "lodash";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
import {WrapperComponent} from "../../../shared/wrapper/wrapper.component";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'installment-detail',
    templateUrl: './installment-detail.component.html',
    styleUrl: './installment-detail.component.less',
    standalone: true,
    imports: [WrapperComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule, ButtonModule, ReactiveFormsModule]
})
export class InstallmentDetailComponent implements OnInit, OnChanges {
    @Input()
    installment!: Installment | null;
    @Output()
    updateInstallmentEvent: EventEmitter<Installment> = new EventEmitter<Installment>();

    initialInstallmentDetailForm!: FormGroup<InstallmentForm>;
    installmentDetailForm!: FormGroup<InstallmentForm>;

    constructor(private installmentFormProvider: InstallmentFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.installment && this.installmentDetailForm) {
            this.fillFormData();
            this.initialInstallmentDetailForm = cloneDeep(this.installmentDetailForm);
        }
    }

    ngOnInit(): void {
        this.installmentDetailForm = this.installmentFormProvider.getInstallmentForm();
        this.fillFormData();
        this.installmentDetailForm.valueChanges.subscribe(() => {
            if (this.installmentDetailForm.value.paid && this.installmentDetailForm.controls.paymentDate.disabled) {
                this.installmentDetailForm.controls.paymentDate.enable();
            } else if (!this.installmentDetailForm.value.paid && this.installmentDetailForm.controls.paymentDate.enabled) {
                this.installmentDetailForm.controls.paymentDate.disable();
            }
        });
    }

    private fillFormData(): void {
        if (!this.installment) {
            return;
        }
        this.installmentDetailForm.patchValue({
            stageName: this.installment.stageName,
            paid: this.installment.paid,
            paymentDate: toDateIfExists(this.installment.paymentDate),
            value: this.installment.value,
            hasInvoice: this.installment.hasInvoice,
        })
        if (this.installment.paid) {
            this.installmentDetailForm.controls.paymentDate.enable();
        } else {
            this.installmentDetailForm.controls.paymentDate.disable();
        }
    }

    isFormChanged(): boolean {
        if (this.installmentDetailForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialInstallmentDetailForm.value) !== JSON.stringify(this.installmentDetailForm.value);
    }

    onSave(): void {
        let installment: Installment;
        installment = {
            stageName: this.installmentDetailForm.value.stageName,
            paid: this.installmentDetailForm.value.paid,
            paymentDate: this.installmentDetailForm.value.paid ? toTimeZoneString(this.installmentDetailForm.controls.paymentDate.value!) : undefined,
            value: this.installmentDetailForm.value.value,
            hasInvoice: this.installmentDetailForm.value.hasInvoice,
        }
        this.updateInstallmentEvent.emit(installment);
    }

}
