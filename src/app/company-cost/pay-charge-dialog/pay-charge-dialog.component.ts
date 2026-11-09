import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {DialogModule} from "primeng/dialog";
import {DatePickerModule} from "primeng/datepicker";
import {ButtonModule} from "primeng/button";
import {CompanyCostCharge} from "../../generated/models/company-cost-charge";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {toDate} from "../model/company-cost";

// Marks a charge as paid, or changes the payment date of a paid one. The amount is always the scheduled one, so the
// payment date is the only field.
@Component({
    selector: 'pay-charge-dialog',
    templateUrl: './pay-charge-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, DatePickerModule, ButtonModule, ReactiveFormsModule, CurrencyPipe, DatePipe]
})
export class PayChargeDialogComponent implements OnChanges {
    @Input()
    visible = false;
    @Input()
    companyCostName = '';
    @Input()
    charge: CompanyCostCharge | null = null;
    @Input()
    saving = false;
    // Emits the payment date as yyyy-MM-dd
    @Output()
    save = new EventEmitter<string>();
    @Output()
    closed = new EventEmitter<void>();

    readonly today = new Date();
    readonly paymentDate = new FormControl<Date | null>(null, [Validators.required]);

    get isEdit(): boolean {
        return !!this.charge?.paid;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.paymentDate.reset(toDate(this.charge?.paymentDate) ?? new Date());
        }
    }

    onSave(): void {
        this.paymentDate.markAsTouched();
        if (this.paymentDate.invalid) {
            return;
        }
        this.save.emit(toTimeZoneString(this.paymentDate.value!));
    }
}
