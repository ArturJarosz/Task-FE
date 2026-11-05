import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Supplier} from "../../../generated/models/supplier";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FinanceComponentSummaryComponent} from "../../../shared/finance-component-summary/finance-component-summary.component";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe} from "@angular/common";
import {EmptyStateComponent, YesNoMarkComponent} from "../../../shared";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../../shared/utils/sort-utils";
import {Supply} from "../../../generated/models/supply";
import {SortRowsPipe} from "../../../shared/sort-rows/sort-rows.pipe";
import {ThreeStepSortDirective} from "../../../shared/sort-rows/three-step-sort.directive";

@Component({
    selector: 'supply-list',
    templateUrl: './supply-list.component.html',
    styleUrl: './supply-list.component.less',
    standalone: true,
    imports: [ThreeStepSortDirective, SortRowsPipe, FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe, EmptyStateComponent, YesNoMarkComponent]
})
export class SupplyListComponent implements OnChanges{
    // "Add supply" under the summary figures; the shell opens the dialog
    @Output()
    add = new EventEmitter<void>();

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: Supply, field: string): SortValue => {
        switch (field) {
            case 'supplier':
                return String(this.supplierIdToSupplier?.get(row.supplierId!) ?? '');
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }
    @Input()
    projectId: number = 0;
    @Input()
    supplyProjectData!: SupplyProjectData | null;
    @Input()
    suppliers! : Supplier[];

    supplierIdToSupplier! : Map<number, String>;
    supplyDataForm!: FormGroup<FinanceObjectSummaryForm>;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.supplierIdToSupplier = new Map(this.suppliers.map(supplier => [supplier.id!, supplier.name!]));
        this.supplyDataForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['supplyProjectData'] && this.supplyProjectData) {
            this.fillFormData();
        }
    }

    private fillFormData(): void {
        if (!this.supplyDataForm || isUndefinedOrEmpty(this.supplyProjectData)) {
            return;
        }

        let paidCount = this.supplyProjectData?.supplies!.filter(supply => {
            return supply.paid
        }).length;

        this.supplyDataForm.patchValue({
            count: this.supplyProjectData?.financialData?.count,
            paid: paidCount,
            netValue: this.supplyProjectData?.financialData?.netValue,
            grossValue: this.supplyProjectData?.financialData?.grossValue,
            incomeTax: this.supplyProjectData?.financialData?.incomeTax,
            vatTax: this.supplyProjectData?.financialData?.vatTax,
        });
    }
}
