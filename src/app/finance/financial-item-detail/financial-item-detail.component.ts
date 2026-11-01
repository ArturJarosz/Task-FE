import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from "@angular/router";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {DatePickerModule} from "primeng/datepicker";
import {DialogModule} from "primeng/dialog";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {MenuModule} from "primeng/menu";
import {SelectModule} from "primeng/select";
import {SkeletonModule} from "primeng/skeleton";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {Textarea} from "primeng/textarea";
import {TooltipModule} from "primeng/tooltip";
import {FinancialItemDetailForm, FinancialItemDetailFormProvider} from "./financial-item-detail-form-provider";
import {EmptyStateComponent, FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {toDateIfExists, toTimeZoneString} from "../../shared/utils/date-utils";
import {changedFields, isControlInvalid, isPaymentDateMissing} from "../../shared/utils/form-utils";
import {capitalize} from "../../shared/utils/label-utils";

// A supply or a contractor job: something a project buys from a partner (supplier or contractor).
// The shells map their own model to and from this shape; partnerId is the supplierId or contractorId.
export interface FinancialItem {
    id?: number;
    projectId?: number;
    name?: string;
    value?: number;
    hasInvoice?: boolean;
    paid?: boolean;
    payable?: boolean;
    paymentDate?: string;
    note?: string;
    partnerId?: number;
}

// Lower-case nouns used in the copy ("Edit supply", "Choose a contractor"), the partner's list route and the PrimeIcon
export interface FinancialItemLabels {
    item: string;
    partner: string;
    partnerRoute: string;
    icon: string;
}

type FinancialItemFormValue = ReturnType<FormGroup<FinancialItemDetailForm>['getRawValue']>;

const DATA_FIELDS: (keyof FinancialItemFormValue)[] = ['name', 'partnerId', 'value', 'hasInvoice', 'paid', 'paymentDate', 'note'];

@Component({
    selector: 'financial-item-detail',
    templateUrl: './financial-item-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, PageHeaderComponent, FieldComponent, EmptyStateComponent, ButtonModule, DatePickerModule,
        DialogModule, InputNumberModule, InputTextModule, MenuModule, SelectModule, SkeletonModule, Textarea,
        ToggleSwitchModule, TooltipModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe]
})
export class FinancialItemDetailComponent implements OnChanges {
    @Input()
    item!: FinancialItem | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    labels!: FinancialItemLabels;
    @Input()
    partners: { id?: number, name?: string }[] = [];
    @Input()
    projectId: number = 0;
    @Input()
    projectName: string = '';
    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    updateEvent: EventEmitter<FinancialItem> = new EventEmitter<FinancialItem>();
    @Output()
    deleteEvent: EventEmitter<{ id: number, name: string }> = new EventEmitter<{ id: number, name: string }>();

    detailForm: FormGroup<FinancialItemDetailForm>;
    private initialValue!: FinancialItemFormValue;
    showEditDialog = false;

    crumbs: PageCrumb[] = [];
    actions: MenuItem[] = [];
    partnerName = '';
    itemTitle = '';
    partnerTitle = '';
    loadErrorTitle = '';

    constructor(private formProvider: FinancialItemDetailFormProvider) {
        this.detailForm = this.formProvider.getFinancialItemDetailForm();
        // The payment date is only meaningful once the item is paid
        this.detailForm.controls.paid.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(paid => this.togglePaymentDate(paid));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['labels']) {
            this.itemTitle = capitalize(this.labels.item);
            this.partnerTitle = capitalize(this.labels.partner);
            this.loadErrorTitle = `Couldn't load this ${this.labels.item}`;
        }
        if (changes['item'] && this.item) {
            this.resetForm();
            this.actions = [
                {label: `Delete ${this.labels.item}`, icon: 'pi pi-trash', command: () => this.onDelete()}
            ];
        }
        if (this.item) {
            this.partnerName = this.partners.find(partner => partner.id === this.item?.partnerId)?.name ?? '';
        }
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Projects', route: ['/projects']},
            {label: this.projectName || 'Project', route: ['/projects', this.projectId]},
            {label: 'Finance', route: ['/projects', this.projectId, 'finance']},
            {label: this.item?.name ?? this.itemTitle},
        ];
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.detailForm, path);
    }

    isPaymentDateMissing(): boolean {
        return isPaymentDateMissing(this.detailForm);
    }

    get dataNeedsUpdate(): boolean {
        return changedFields(this.initialValue, this.detailForm.getRawValue(), DATA_FIELDS).length > 0;
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
        this.updateEvent.emit({
            id: this.item?.id,
            projectId: this.item?.projectId,
            name: value.name,
            value: value.value,
            hasInvoice: value.hasInvoice,
            paid: value.paid,
            paymentDate: value.paid ? toTimeZoneString(value.paymentDate ?? undefined) : undefined,
            note: value.note,
            partnerId: value.partnerId ?? undefined,
            payable: this.item?.payable
        });
        this.showEditDialog = false;
    }

    onDelete(): void {
        if (this.item?.id && this.item?.name) {
            this.deleteEvent.emit({id: this.item.id, name: this.item.name});
        }
    }

    private togglePaymentDate(paid: boolean): void {
        const paymentDate = this.detailForm.controls.paymentDate;
        if (paid) {
            paymentDate.enable();
        } else {
            paymentDate.disable();
        }
    }

    private resetForm(): void {
        if (!this.item) {
            return;
        }
        this.detailForm.reset({
            name: this.item.name ?? '',
            partnerId: this.item.partnerId ?? null,
            value: this.item.value ?? 0,
            hasInvoice: this.item.hasInvoice ?? false,
            paid: this.item.paid ?? false,
            paymentDate: toDateIfExists(this.item.paymentDate) ?? null,
            note: this.item.note ?? ''
        });
        this.togglePaymentDate(this.item.paid ?? false);
        this.initialValue = this.detailForm.getRawValue();
    }
}
