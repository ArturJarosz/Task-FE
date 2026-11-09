import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {startOfMonth} from "date-fns";
import {DialogModule} from "primeng/dialog";
import {DatePickerModule} from "primeng/datepicker";
import {ButtonModule} from "primeng/button";
import {CompanyCost} from "../../generated/models/company-cost";
import {monthLabel, toDate, toMonthString} from "../model/company-cost";

// Sets the last month of a recurring cost. Its payments and earlier amounts stay; amounts that would start after the
// last month are removed, which the dialog warns about.
@Component({
    selector: 'end-cost-dialog',
    templateUrl: './end-cost-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, DatePickerModule, ButtonModule, ReactiveFormsModule]
})
export class EndCostDialogComponent implements OnChanges {
    @Input()
    visible = false;
    @Input()
    companyCost: CompanyCost | null = null;
    @Input()
    saving = false;
    // Emits the last month as yyyy-MM-01
    @Output()
    save = new EventEmitter<string>();
    @Output()
    closed = new EventEmitter<void>();

    readonly lastMonth = new FormControl<Date | null>(null, [Validators.required]);

    get minMonth(): Date | undefined {
        return toDate(this.companyCost?.startMonth);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            const thisMonth = startOfMonth(new Date());
            const start = this.minMonth;
            this.lastMonth.reset(start && start > thisMonth ? start : thisMonth);
        }
    }

    lastMonthLabel(): string {
        return this.lastMonth.value ? monthLabel(toMonthString(this.lastMonth.value)) : '';
    }

    // Amounts starting after the chosen last month, which ending the cost removes
    droppedAmounts(): number {
        if (!this.lastMonth.value) {
            return 0;
        }
        const month = toMonthString(this.lastMonth.value);
        return (this.companyCost?.amounts ?? []).filter(amount => (amount.validFrom ?? '') > month).length;
    }

    onSave(): void {
        this.lastMonth.markAsTouched();
        if (this.lastMonth.invalid) {
            return;
        }
        this.save.emit(toMonthString(this.lastMonth.value!));
    }
}
