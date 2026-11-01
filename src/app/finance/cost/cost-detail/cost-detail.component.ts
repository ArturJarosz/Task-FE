import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {DatePickerModule} from "primeng/datepicker";
import {DialogModule} from "primeng/dialog";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {SelectModule} from "primeng/select";
import {SkeletonModule} from "primeng/skeleton";
import {Textarea} from "primeng/textarea";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {CostDetailFormProvider, CostForm} from "./cost-detail-form-provider";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../../shared";
import {resolveLabel} from "../../../shared/utils/label-utils";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
import {changedFields, isControlInvalid, isPaymentDateMissing} from "../../../shared/utils/form-utils";

type CostFormValue = ReturnType<FormGroup<CostForm>['getRawValue']>;

const DATA_FIELDS: (keyof CostFormValue)[] = ['name', 'category', 'value', 'date', 'hasInvoice', 'paid', 'paymentDate', 'note'];

@Component({
    selector: 'cost-detail',
    templateUrl: './cost-detail.component.html',
    styleUrl: './cost-detail.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, PageHeaderComponent, FieldComponent, ButtonModule, DatePickerModule, DialogModule, InputNumberModule,
        InputTextModule, SelectModule, SkeletonModule, Textarea, ToggleSwitchModule, ReactiveFormsModule,
        CurrencyPipe, DatePipe]
})
export class CostDetailComponent implements OnInit, OnChanges {
    @Input()
    cost!: Cost | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    costCategories!: ConfigurationEntry[] | null;
    @Input()
    projectId: number = 0;
    @Input()
    projectName: string = '';
    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    updateCostEvent: EventEmitter<Cost> = new EventEmitter<Cost>();

    costDetailsForm: FormGroup<CostForm>;
    private initialValue!: CostFormValue;
    showEditDialog = false;

    crumbs: PageCrumb[] = [];
    categoryLabel = '';

    constructor(private formProvider: CostDetailFormProvider) {
        this.costDetailsForm = this.formProvider.getCostDetailForm();
        // The payment date is only meaningful once the cost is paid
        this.costDetailsForm.controls.paid.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(paid => this.togglePaymentDate(paid));
    }

    ngOnInit(): void {
        this.resetForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['cost'] && this.cost) {
            this.resetForm();
        }
        if (this.cost) {
            this.categoryLabel = resolveLabel(this.cost.categoryId, this.costCategories ?? []);
        }
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Projects', route: ['/projects']},
            {label: this.projectName || 'Project', route: ['/projects', this.projectId]},
            {label: 'Finance', route: ['/projects', this.projectId, 'finance']},
            {label: this.cost?.name ?? 'Cost'},
        ];
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.costDetailsForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.costDetailsForm);
    }

    get dataNeedsUpdate(): boolean {
        return changedFields(this.initialValue, this.costDetailsForm.getRawValue(), DATA_FIELDS).length > 0;
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
        const value = this.costDetailsForm.getRawValue();
        this.updateCostEvent.emit({
            name: value.name,
            categoryId: Number(value.category),
            note: value.note ?? undefined,
            paid: value.paid,
            value: value.value,
            // Set to true on every save until the reimbursable flag is exposed in the UI
            payable: true,
            hasInvoice: value.hasInvoice,
            date: toTimeZoneString(value.date),
            paymentDate: value.paid ? toTimeZoneString(value.paymentDate ?? undefined) : undefined
        });
        this.showEditDialog = false;
    }

    private togglePaymentDate(paid: boolean): void {
        const paymentDate = this.costDetailsForm.controls.paymentDate;
        if (paid) {
            paymentDate.enable();
        } else {
            paymentDate.disable();
        }
    }

    private resetForm(): void {
        if (!this.cost) {
            return;
        }
        this.costDetailsForm.reset({
            id: this.cost.id ?? 0,
            name: this.cost.name ?? '',
            date: toDateIfExists(this.cost.date) ?? new Date(),
            category: this.cost.categoryId != null ? String(this.cost.categoryId) : '',
            value: this.cost.value ?? 0,
            note: this.cost.note ?? '',
            hasInvoice: this.cost.hasInvoice ?? false,
            payable: this.cost.payable ?? true,
            paid: this.cost.paid ?? false,
            paymentDate: toDateIfExists(this.cost.paymentDate) ?? null
        });
        this.togglePaymentDate(this.cost.paid ?? false);
        this.initialValue = this.costDetailsForm.getRawValue();
    }
}
