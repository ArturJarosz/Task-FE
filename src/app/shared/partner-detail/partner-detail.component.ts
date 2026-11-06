import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {MenuModule} from "primeng/menu";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FinancialPartialData} from "../../generated/models/financial-partial-data";
import {capitalize, initials, resolveLabel} from "../utils/label-utils";
import {PageCrumb, PageHeaderComponent} from "../page-header/page-header.component";
import {FieldComponent} from "../field/field.component";
import {EmptyStateComponent} from "../empty-state/empty-state.component";
import {PartnerFormFieldsComponent} from "../partner-form-fields/partner-form-fields.component";
import {FinanceComponentSummaryComponent} from "../finance-component-summary/finance-component-summary.component";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";
import {PartnerRef} from "../partner-list/partner-list.component";
import {NotSetComponent} from "../not-set/not-set.component";
import {YesNoMarkComponent} from "../yes-no-mark/yes-no-mark.component";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {SortRowsPipe} from "../../shared/sort-rows/sort-rows.pipe";
import {showErrors} from "../../shared/utils/form-utils";
import {ThreeStepSortDirective} from "../sort-rows/three-step-sort.directive";

// Contractor or supplier, as shown and edited on its detail page
export interface Partner {
    id?: number;
    name?: string;
    categoryId?: number;
    email?: string;
    telephone?: string;
    note?: string;
    createdDateTime?: string;
}

// A contractor job or a supply: work billed to a project
export interface PartnerItem {
    id?: number;
    name?: string;
    projectId?: number;
    value?: number;
    hasInvoice?: boolean;
    paid?: boolean;
}

export interface PartnerItemsData {
    items: PartnerItem[];
    financialData?: FinancialPartialData;
    averageFinancialData?: FinancialPartialData;
}

// Detail page for contractors and suppliers (DESIGN_GUIDELINES.md, "Detail page" and "Edit dialog")
@Component({
    selector: 'app-partner-detail',
    templateUrl: 'partner-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ThreeStepSortDirective, SortRowsPipe, PageHeaderComponent, FieldComponent, EmptyStateComponent, PartnerFormFieldsComponent,
        FinanceComponentSummaryComponent, ButtonModule, DialogModule, MenuModule, TableModule, TooltipModule,
        ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, NotSetComponent, YesNoMarkComponent]
})
export class PartnerDetailComponent implements OnChanges {

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: PartnerItem, field: string): SortValue => {
        switch (field) {
            case 'project':
                return this.projectNames.get(row.projectId!);
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }
    @Input()
    partner!: Partner;
    @Input()
    categories: ConfigurationEntry[] | null = [];
    @Input()
    itemsData: PartnerItemsData = {items: []};
    @Input()
    projectNames: Map<number, string> = new Map<number, string>();
    // Singular noun, e.g. "contractor"; the list page lives at /<entityLabel>s
    @Input()
    entityLabel: string = '';
    // Section title and project route segment of the items, e.g. "Jobs" and "contractorJob"
    @Input()
    itemsLabel: string = '';
    // Lower case singular for counts: "1 job", "2 jobs"
    @Input()
    itemLabel: string = '';
    @Input()
    itemRouteSegment: string = '';
    @Input()
    itemsIcon: string = 'pi pi-inbox';
    @Input()
    itemsEmptyText: string = '';
    @Output()
    updateEvent: EventEmitter<Partner> = new EventEmitter<Partner>();
    @Output()
    deleteEvent: EventEmitter<PartnerRef> = new EventEmitter<PartnerRef>();

    form: FormGroup;
    initialFormValue: string = '';
    showEditDialog: boolean = false;

    summaryForm: FormGroup<FinanceObjectSummaryForm>;
    averageSummaryForm: FormGroup<FinanceObjectSummaryForm>;

    categoryLabel: string = '';
    initials: string = '';
    crumbs: PageCrumb[] = [];
    actions: MenuItem[] = [];

    constructor(private formBuilder: FormBuilder, private summaryFormProvider: ProjectFinancialSummaryFormProvider) {
        this.form = this.createForm();
        this.summaryForm = this.summaryFormProvider.getFinanceObjectSummaryForm();
        this.averageSummaryForm = this.summaryFormProvider.getFinanceObjectSummaryForm();
    }

    get entityTitle(): string {
        return capitalize(this.entityLabel);
    }

    ngOnChanges(changes: SimpleChanges): void {
        let name = this.partner.name ?? '';
        this.categoryLabel = resolveLabel(this.partner.categoryId, this.categories);
        this.initials = initials(name);
        this.crumbs = [
            {label: 'Home', route: ['/home']},
            {label: `${this.entityTitle}s`, route: [`/${this.entityLabel}s`]},
            {label: name},
        ];
        this.actions = [{label: `Delete ${this.entityLabel}`, icon: 'pi pi-trash', command: () => this.onDelete()}];
        if (changes['partner']) {
            this.resetForm();
        }
        if (changes['itemsData']) {
            this.fillSummaries();
        }
    }

    private createForm(): FormGroup {
        return this.formBuilder.group({
            name: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            // id of the category as a string, the way configuration entries hold it
            category: this.formBuilder.nonNullable.control<string>('', [Validators.required]),
            email: this.formBuilder.control<string>(''),
            telephone: this.formBuilder.control<string>(''),
            note: this.formBuilder.control<string>(''),
        });
    }

    private fillSummaries(): void {
        let items = this.itemsData.items;
        let total = this.itemsData.financialData;
        let average = this.itemsData.averageFinancialData;
        this.summaryForm = this.summaryFormProvider.getFinanceObjectSummaryForm();
        this.summaryForm.patchValue({
            count: total?.count ?? items.length,
            paid: items.filter(item => item.paid).length,
            grossValue: total?.grossValue,
            netValue: total?.netValue,
            incomeTax: total?.incomeTax,
            vatTax: total?.vatTax,
        });
        this.averageSummaryForm = this.summaryFormProvider.getFinanceObjectSummaryForm();
        this.averageSummaryForm.patchValue({
            grossValue: average?.grossValue,
            netValue: average?.netValue,
            incomeTax: average?.incomeTax,
            vatTax: average?.vatTax,
        });
    }

    resetForm(): void {
        this.form = this.createForm();
        this.form.patchValue({
            name: this.partner.name,
            category: this.partner.categoryId != null ? String(this.partner.categoryId) : '',
            email: this.partner.email,
            telephone: this.partner.telephone,
            note: this.partner.note,
        });
        this.initialFormValue = JSON.stringify(this.form.getRawValue());
    }

    isSaveEnabled(): boolean {
        return this.form.valid && this.hasChanges();
    }

    // Save stays enabled once something changed, also with errors: saving then shows them
    hasChanges(): boolean {
        return JSON.stringify(this.form.getRawValue()) !== this.initialFormValue;
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
        // Disabled only while nothing changed: with something missing, saving shows every error instead
        if (showErrors(this.form)) {
            return;
        }
        let value = this.form.getRawValue();
        this.showEditDialog = false;
        this.updateEvent.emit({
            name: value.name,
            categoryId: Number(value.category),
            email: value.email,
            telephone: value.telephone,
            note: value.note,
        });
    }

    onDelete(): void {
        this.deleteEvent.emit({id: this.partner.id!, name: this.partner.name ?? ''});
    }
}
