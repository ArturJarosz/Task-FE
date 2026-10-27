import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, LOCALE_ID, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DecimalPipe, formatDate} from "@angular/common";
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {DatePickerModule} from "primeng/datepicker";
import {DialogModule} from "primeng/dialog";
import {InputNumberModule} from "primeng/inputnumber";
import {MenuModule} from "primeng/menu";
import {SkeletonModule} from "primeng/skeleton";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {TooltipModule} from "primeng/tooltip";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {SupervisionVisitForm, SupervisionVisitFormProvider} from "../form/supervision-visit-form-provider";
import {FieldComponent, LoadErrorComponent, PageCrumb, PageHeaderComponent} from "../../../shared";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";
import {changedFields, isControlInvalid} from "../../../shared/utils/form-utils";

type VisitFormValue = ReturnType<FormGroup<SupervisionVisitForm>['getRawValue']>;

const DATA_FIELDS: (keyof VisitFormValue)[] = ['dateOfVisit', 'hoursCount', 'payable'];

@Component({
    selector: 'supervision-visit-detail',
    templateUrl: './supervision-visit-detail.component.html',
    styleUrl: './supervision-visit-detail.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, PageHeaderComponent, FieldComponent, ButtonModule, DatePickerModule, DialogModule,
        InputNumberModule, MenuModule, SkeletonModule, ToggleSwitchModule, TooltipModule, ReactiveFormsModule, DecimalPipe]
})
export class SupervisionVisitDetailComponent implements OnChanges {
    @Input()
    supervisionVisit!: SupervisionVisit | null;
    @Input()
    loadFailed: boolean = false;
    @Input()
    projectId: number = 0;
    @Input()
    projectName: string = '';

    @Output()
    reloadEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    updateVisitEvent: EventEmitter<SupervisionVisit> = new EventEmitter<SupervisionVisit>();
    @Output()
    deleteVisitEvent: EventEmitter<{ visitId: number, visitDate: string }> = new EventEmitter<{ visitId: number, visitDate: string }>();

    private readonly locale = inject(LOCALE_ID);

    visitDetailForm: FormGroup<SupervisionVisitForm>;
    private initialValue!: VisitFormValue;
    showEditDialog = false;
    // Set by "Save changes" until the store returns the saved visit; the form keeps the edits so a failed save can be retried
    private savePending = false;

    crumbs: PageCrumb[] = [];
    actions: MenuItem[] = [
        {label: 'Delete visit', icon: 'pi pi-trash', command: () => this.onDelete()}
    ];
    visitDate = '';

    constructor(private supervisionVisitFormProvider: SupervisionVisitFormProvider) {
        this.visitDetailForm = this.supervisionVisitFormProvider.getSupervisionVisitForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['supervisionVisit'] && this.supervisionVisit) {
            this.resetForm();
        }
        this.visitDate = this.supervisionVisit?.dateOfVisit
            ? formatDate(this.supervisionVisit.dateOfVisit, 'dd.MM.yyyy', this.locale)
            : '';
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: 'Projects', route: ['/projects']},
            {label: this.projectName || 'Project', route: ['/projects', this.projectId]},
            {label: 'Finance', route: ['/projects', this.projectId, 'finance']},
            {label: this.visitDate ? `Visit ${this.visitDate}` : 'Visit'},
        ];
    }

    isFieldInvalid(path: string): boolean {
        return isControlInvalid(this.visitDetailForm, path);
    }

    get dataNeedsUpdate(): boolean {
        return changedFields(this.initialValue, this.visitDetailForm.getRawValue(), DATA_FIELDS).length > 0;
    }

    onEdit(): void {
        if (!this.savePending) {
            this.resetForm();
        }
        this.showEditDialog = true;
    }

    onCancelEdit(): void {
        this.showEditDialog = false;
        this.resetForm();
    }

    onEditDialogHide(): void {
        if (!this.savePending) {
            this.resetForm();
        }
    }

    onSave(): void {
        const value = this.visitDetailForm.getRawValue();
        this.updateVisitEvent.emit({
            id: this.supervisionVisit?.id,
            supervisionId: this.supervisionVisit?.supervisionId,
            dateOfVisit: toTimeZoneString(value.dateOfVisit ?? undefined),
            hoursCount: value.hoursCount ?? 0,
            payable: value.payable
        });
        this.savePending = true;
        this.showEditDialog = false;
    }

    onDelete(): void {
        if (this.supervisionVisit?.id) {
            this.deleteVisitEvent.emit({visitId: this.supervisionVisit.id, visitDate: this.visitDate});
        }
    }

    private resetForm(): void {
        if (!this.supervisionVisit) {
            return;
        }
        this.visitDetailForm.reset({
            dateOfVisit: toDateIfExists(this.supervisionVisit.dateOfVisit) ?? null,
            hoursCount: this.supervisionVisit.hoursCount ?? 0,
            payable: this.supervisionVisit.payable ?? false
        });
        this.initialValue = this.visitDetailForm.getRawValue();
        this.savePending = false;
    }
}
