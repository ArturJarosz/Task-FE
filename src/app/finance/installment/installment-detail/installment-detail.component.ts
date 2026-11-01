import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {endOfToday, startOfToday} from "date-fns";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {DatePickerModule} from "primeng/datepicker";
import {DialogModule} from "primeng/dialog";
import {InputNumberModule} from "primeng/inputnumber";
import {SkeletonModule} from "primeng/skeleton";
import {Textarea} from "primeng/textarea";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {Installment} from "../../../generated/models/installment";
import {InstallmentForm, InstallmentFormProvider} from "../form/installment-form-provider";
import {InstallmentSave} from "../state/installment.state";
import {EmptyStateComponent, FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../../shared";
import {installmentName, isDeposit} from "../installment-utils";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
import {changedFields, isControlInvalid, isPaymentDateMissing, paymentDateRequiredWhenPaid} from "../../../shared/utils/form-utils";

type InstallmentFormValue = ReturnType<FormGroup<InstallmentForm>['getRawValue']>;

// What the update endpoint changes. It keeps the paid flag, and takes a payment date only for an installment that is
// already paid; marking one paid is the separate payment endpoint.
const DATA_FIELDS: (keyof InstallmentFormValue)[] = ['value', 'hasInvoice', 'note'];

@Component({
    selector: 'installment-detail',
    templateUrl: './installment-detail.component.html',
    styleUrl: './installment-detail.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, PageHeaderComponent, FieldComponent, EmptyStateComponent, ButtonModule, DatePickerModule,
        DialogModule, InputNumberModule, SkeletonModule, Textarea, ToggleSwitchModule, ReactiveFormsModule, RouterLink,
        CurrencyPipe, DatePipe]
})
export class InstallmentDetailComponent implements OnChanges {
    @Input()
    installment!: Installment | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    projectId: number = 0;
    @Input()
    projectName: string = '';
    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    saveEvent: EventEmitter<InstallmentSave> = new EventEmitter<InstallmentSave>();

    detailForm: FormGroup<InstallmentForm>;
    private initialValue!: InstallmentFormValue;
    showEditDialog = false;
    // The backend refuses payment dates in the future. End of the day, so a date picked or suggested today is never past it
    readonly latestPaymentDate = endOfToday();

    crumbs: PageCrumb[] = [];
    name: string = '';
    deposit: boolean = false;

    constructor(private formProvider: InstallmentFormProvider) {
        this.detailForm = this.formProvider.getInstallmentForm();
        this.detailForm.addValidators(paymentDateRequiredWhenPaid);
        this.detailForm.controls.paid.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(paid => this.togglePaymentDate(paid));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['installment'] && this.installment) {
            this.resetForm();
        }
        this.name = installmentName(this.installment);
        this.deposit = isDeposit(this.installment);
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Projects', route: ['/projects']},
            {label: this.projectName || 'Project', route: ['/projects', this.projectId]},
            {label: 'Finance', route: ['/projects', this.projectId, 'finance']},
            {label: this.installment ? this.name : 'Installment'},
        ];
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.detailForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.detailForm);
    }

    get dataChanged(): boolean {
        const fields: (keyof InstallmentFormValue)[] = this.installment?.paid ? [...DATA_FIELDS, 'paymentDate'] : DATA_FIELDS;
        return changedFields(this.initialValue, this.detailForm.getRawValue(), fields).length > 0;
    }

    // Turned on in this dialog: a payment can't be undone, so an installment already paid never counts
    get newlyPaid(): boolean {
        return !this.installment?.paid && this.detailForm.controls.paid.value;
    }

    onEdit(): void {
        this.resetForm();
        this.showEditDialog = true;
    }

    onCancelEdit(): void {
        this.showEditDialog = false;
        this.resetForm();
    }

    onSave(): void {
        const value = this.detailForm.getRawValue();
        const alreadyPaid = this.installment?.paid ?? false;
        const paymentDate = value.paymentDate ? toTimeZoneString(value.paymentDate) : undefined;
        this.saveEvent.emit({
            installment: this.dataChanged ? {
                stageName: this.installment?.stageName,
                value: value.value,
                hasInvoice: value.hasInvoice,
                paid: alreadyPaid,
                paymentDate: alreadyPaid ? paymentDate : undefined,
                // The backend replaces the note with what is sent, so it always goes along
                note: value.note ?? undefined,
            } : undefined,
            paymentDate: this.newlyPaid ? paymentDate : undefined
        });
        this.showEditDialog = false;
    }

    private togglePaymentDate(paid: boolean): void {
        const paymentDate = this.detailForm.controls.paymentDate;
        if (paid) {
            paymentDate.enable({emitEvent: false});
            // Turning Paid on: most payments are recorded on the day they arrive. Midnight, like a date picked in the calendar
            if (!this.installment?.paid && !paymentDate.value) {
                paymentDate.setValue(startOfToday());
            }
        } else {
            paymentDate.disable({emitEvent: false});
        }
    }

    private resetForm(): void {
        if (!this.installment) {
            return;
        }
        const paid = this.installment.paid ?? false;
        this.detailForm.reset({
            value: this.installment.value ?? 0,
            stageId: this.installment.stageId ?? 0,
            stageName: this.installment.stageName ?? '',
            hasInvoice: this.installment.hasInvoice ?? false,
            note: this.installment.note ?? '',
            paid: paid,
            paymentDate: toDateIfExists(this.installment.paymentDate) ?? null
        });
        // A payment can't be undone, so a paid installment can't be switched back
        if (paid) {
            this.detailForm.controls.paid.disable({emitEvent: false});
        } else {
            this.detailForm.controls.paid.enable({emitEvent: false});
        }
        this.togglePaymentDate(paid);
        this.initialValue = this.detailForm.getRawValue();
    }
}
