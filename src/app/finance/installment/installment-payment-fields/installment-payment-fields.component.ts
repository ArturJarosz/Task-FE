import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InstallmentForm} from "../form/installment-form-provider";
import {isControlInvalid, isPaymentDateMissing} from "../../../shared/utils/form-utils";

// Invoice, paid, value and payment date of a new installment, shared by the New installment dialog and the deposit
// in the contract dialog. The form comes from InstallmentFormProvider with the add rules (value above 0, a payment
// date when paid).
@Component({
    selector: 'app-installment-payment-fields',
    templateUrl: 'installment-payment-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    standalone: true,
    imports: [ReactiveFormsModule, InputNumberModule, ToggleSwitchModule, DatePickerModule]
})
export class InstallmentPaymentFieldsComponent {
    @Input()
    form!: FormGroup<InstallmentForm>;
    // Keeps the input ids unique when two dialogs are on one page
    @Input()
    idPrefix: string = 'installment';
    @Input()
    valueLabel: string = 'Value';
    @Input()
    maxPaymentDate: Date | null = null;

    @Output()
    paidChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.form, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.form);
    }
}
