import {
    ChangeDetectionStrategy,
    Component,
    computed,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    signal,
    Signal,
    SimpleChanges
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from "@angular/forms";
import {format} from "date-fns";
import {DialogModule} from "primeng/dialog";
import {SelectModule} from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {DatePickerModule} from "primeng/datepicker";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostKind} from "../../generated/models/company-cost-kind";
import {CompanyCostRepeats} from "../../generated/models/company-cost-repeats";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {isControlInvalid, isPaymentDateMissing, paymentDateRequiredWhenPaid, showErrors} from "../../shared/utils/form-utils";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {pastChargeDates, REPEATS_OPTIONS, toDate, toMonthString} from "../model/company-cost";

export interface CompanyCostForm {
    kind: FormControl<CompanyCostKind>;
    name: FormControl<string>;
    // id of the category as a string, the way configuration entries hold it
    category: FormControl<string>;
    netValue: FormControl<number | null>;
    repeats: FormControl<CompanyCostRepeats>;
    date: FormControl<Date | null>;
    startMonth: FormControl<Date | null>;
    endMonth: FormControl<Date | null>;
    chargeDay: FormControl<number | null>;
    hasInvoice: FormControl<boolean>;
    markPastChargesAsPaid: FormControl<boolean>;
    paid: FormControl<boolean>;
    paymentDate: FormControl<Date | null>;
    note: FormControl<string | null>;
}

// Form group validator: the end month of a recurring cost can't be before its start month
function endNotBeforeStart(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startMonth')?.value as Date | null;
    const end = group.get('endMonth')?.value as Date | null;
    return start && end && (end.getFullYear() * 12 + end.getMonth()) < (start.getFullYear() * 12 + start.getMonth())
        ? {endBeforeStart: true} : null;
}

// Creates a company cost (companyCost null) or edits one. The type is chosen only when creating. A new recurring cost
// sets its first amount here; later changes of a recurring cost's amount go through Change amount.
@Component({
    selector: 'company-cost-dialog',
    templateUrl: './company-cost-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, SelectModule, InputNumberModule, ToggleSwitchModule, DatePickerModule, InputTextModule,
        ButtonModule, ReactiveFormsModule]
})
export class CompanyCostDialogComponent implements OnChanges {
    @Input()
    visible = false;
    @Input()
    companyCost: CompanyCost | null = null;
    @Input()
    categories: ConfigurationEntry[] = [];
    @Input()
    saving = false;
    @Output()
    save = new EventEmitter<CompanyCost>();
    @Output()
    closed = new EventEmitter<void>();

    readonly repeatsOptions = REPEATS_OPTIONS;
    readonly kinds = [
        {label: 'One-time', value: CompanyCostKind.ONE_TIME},
        {label: 'Recurring', value: CompanyCostKind.RECURRING},
    ];
    readonly CompanyCostKind = CompanyCostKind;
    readonly today = new Date();

    private readonly formBuilder = inject(FormBuilder);
    form: FormGroup<CompanyCostForm> = this.createForm(null);
    // Mirrors the form, so the computed past charges follow it
    private readonly $formValue = signal(this.form.getRawValue());

    readonly $pastCharges: Signal<Date[]> = computed(() => {
        const value = this.$formValue();
        if (value.kind !== CompanyCostKind.RECURRING || !value.startMonth || !value.chargeDay
            || value.chargeDay < 1 || value.chargeDay > 31) {
            return [];
        }
        return pastChargeDates(value.repeats, value.startMonth, value.endMonth, value.chargeDay, this.today);
    });

    get isEdit(): boolean {
        return !!this.companyCost;
    }

    get isRecurring(): boolean {
        return this.form.controls.kind.value === CompanyCostKind.RECURRING;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.form = this.createForm(this.companyCost);
            this.$formValue.set(this.form.getRawValue());
            this.form.valueChanges.subscribe(() => this.$formValue.set(this.form.getRawValue()));
        }
    }

    onSelectKind(kind: CompanyCostKind): void {
        this.form.controls.kind.setValue(kind);
        this.updateValidators();
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.form, path);
    }

    isEndBeforeStart(): boolean {
        return this.form.hasError('endBeforeStart') && (this.form.controls.endMonth.dirty
            || this.form.controls.endMonth.touched);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.form);
    }

    pastChargesHint(): string {
        const dates = this.$pastCharges();
        const first = format(dates[0], 'dd.MM.yyyy');
        const last = format(dates[dates.length - 1], 'dd.MM.yyyy');
        return dates.length === 1
            ? `The charge of ${first} is saved as paid on that day.`
            : `The ${dates.length} charges from ${first} to ${last} are saved as paid on their charge dates.`;
    }

    onSave(): void {
        if (showErrors(this.form)) {
            return;
        }
        this.save.emit(this.toCompanyCost());
    }

    onHide(): void {
        this.closed.emit();
    }

    private toCompanyCost(): CompanyCost {
        const value = this.form.getRawValue();
        const companyCost: CompanyCost = {
            kind: value.kind,
            name: value.name.trim(),
            categoryId: Number(value.category),
            hasInvoice: value.hasInvoice,
            note: value.note?.trim() || undefined,
        };
        if (value.kind === CompanyCostKind.RECURRING) {
            return {
                ...companyCost,
                repeats: value.repeats,
                startMonth: toMonthString(value.startMonth!),
                endMonth: value.endMonth ? toMonthString(value.endMonth) : undefined,
                chargeDay: value.chargeDay!,
                // Only a new cost takes its first amount and past payments from here
                netValue: this.isEdit ? undefined : value.netValue!,
                markPastChargesAsPaid: !this.isEdit && this.$pastCharges().length > 0 && value.markPastChargesAsPaid,
            };
        }
        return {
            ...companyCost,
            date: toTimeZoneString(value.date!),
            netValue: value.netValue!,
            paid: !this.isEdit && value.paid,
            paymentDate: !this.isEdit && value.paid && value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined,
        };
    }

    private createForm(companyCost: CompanyCost | null): FormGroup<CompanyCostForm> {
        const fb = this.formBuilder.nonNullable;
        const form = fb.group<CompanyCostForm>({
            kind: fb.control(companyCost?.kind ?? CompanyCostKind.RECURRING),
            name: fb.control(companyCost?.name ?? '', [Validators.required, Validators.maxLength(255)]),
            category: fb.control(companyCost?.categoryId != null ? String(companyCost.categoryId) : '',
                [Validators.required]),
            netValue: this.formBuilder.control<number | null>(companyCost?.netValue ?? null),
            repeats: fb.control(companyCost?.repeats ?? CompanyCostRepeats.MONTHLY),
            date: this.formBuilder.control<Date | null>(toDate(companyCost?.date) ?? new Date()),
            startMonth: this.formBuilder.control<Date | null>(toDate(companyCost?.startMonth) ?? new Date()),
            endMonth: this.formBuilder.control<Date | null>(toDate(companyCost?.endMonth) ?? null),
            chargeDay: this.formBuilder.control<number | null>(companyCost?.chargeDay ?? new Date().getDate()),
            hasInvoice: fb.control(companyCost?.hasInvoice ?? false),
            markPastChargesAsPaid: fb.control(false),
            paid: fb.control(false),
            paymentDate: this.formBuilder.control<Date | null>(null),
            note: this.formBuilder.control<string | null>(companyCost?.note ?? null, [Validators.maxLength(255)]),
        }, {validators: [endNotBeforeStart, paymentDateRequiredWhenPaid]});
        this.form = form;
        this.updateValidators();
        return form;
    }

    // Required fields follow the type; a recurring cost being edited has no net value field
    private updateValidators(): void {
        const controls = this.form.controls;
        const recurring = this.isRecurring;
        const setRequired = (control: AbstractControl, required: boolean, ...others: any[]) => {
            control.setValidators(required ? [Validators.required, ...others] : []);
            control.updateValueAndValidity({emitEvent: false});
        };
        setRequired(controls.netValue, !(recurring && this.isEdit), Validators.min(0.01));
        setRequired(controls.date, !recurring);
        setRequired(controls.startMonth, recurring);
        setRequired(controls.chargeDay, recurring, Validators.min(1), Validators.max(31));
        this.form.updateValueAndValidity();
    }
}
