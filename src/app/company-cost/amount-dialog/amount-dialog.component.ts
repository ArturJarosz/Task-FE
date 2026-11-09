import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CurrencyPipe} from "@angular/common";
import {addMonths, startOfMonth} from "date-fns";
import {DialogModule} from "primeng/dialog";
import {DatePickerModule} from "primeng/datepicker";
import {InputNumberModule} from "primeng/inputnumber";
import {ButtonModule} from "primeng/button";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostAmount} from "../../generated/models/company-cost-amount";
import {isControlInvalid, showErrors} from "../../shared/utils/form-utils";
import {monthLabel, toDate, toMonthString} from "../model/company-cost";

// Changes the amount of a recurring cost from a month on (amount null), or edits one entry of its amount history.
// The first amount always starts with the cost, so its month can't change.
@Component({
    selector: 'amount-dialog',
    templateUrl: './amount-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, DatePickerModule, InputNumberModule, ButtonModule, ReactiveFormsModule, CurrencyPipe]
})
export class AmountDialogComponent implements OnChanges {
    @Input()
    visible = false;
    @Input()
    companyCost: CompanyCost | null = null;
    @Input()
    amount: CompanyCostAmount | null = null;
    @Input()
    saving = false;
    @Output()
    save = new EventEmitter<CompanyCostAmount>();
    @Output()
    closed = new EventEmitter<void>();

    readonly form = new FormGroup({
        netValue: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
        validFrom: new FormControl<Date | null>(null, [Validators.required]),
    });

    get isEdit(): boolean {
        return !!this.amount;
    }

    get isFirst(): boolean {
        const amounts = this.companyCost?.amounts ?? [];
        return !!this.amount && amounts[amounts.length - 1]?.id === this.amount.id;
    }

    get minMonth(): Date | undefined {
        return toDate(this.companyCost?.startMonth);
    }

    get maxMonth(): Date | undefined {
        return toDate(this.companyCost?.endMonth);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            // A new amount starts next month, or within the cost's months when they lie outside it
            const start = this.minMonth;
            const end = this.maxMonth;
            let month = startOfMonth(addMonths(new Date(), 1));
            month = start && start > month ? start : month;
            month = end && end < month ? end : month;
            this.form.reset({
                netValue: this.amount?.netValue ?? null,
                validFrom: toDate(this.amount?.validFrom) ?? month,
            });
            if (this.isFirst) {
                this.form.controls.validFrom.disable();
            } else {
                this.form.controls.validFrom.enable();
            }
        }
    }

    // "Charges before 12.2026 keep 289,00 zł": the amount valid until the chosen month
    previousAmount(): CompanyCostAmount | undefined {
        const validFrom = this.form.controls.validFrom.value;
        if (!validFrom || this.isFirst) {
            return undefined;
        }
        const month = toMonthString(validFrom);
        return (this.companyCost?.amounts ?? [])
            .find(amount => amount.id !== this.amount?.id && (amount.validFrom ?? '') < month);
    }

    validFromLabel(): string {
        const validFrom = this.form.controls.validFrom.value;
        return validFrom ? monthLabel(toMonthString(validFrom)) : '';
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.form, path);
    }

    onSave(): void {
        if (showErrors(this.form)) {
            return;
        }
        const value = this.form.getRawValue();
        this.save.emit({id: this.amount?.id, netValue: value.netValue!, validFrom: toMonthString(value.validFrom!)});
    }
}
