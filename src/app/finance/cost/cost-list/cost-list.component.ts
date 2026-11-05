import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

import {resolveKnownLabel} from "../../../shared/utils/label-utils";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {CostProjectData} from "../../../generated/models/cost-project-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FinanceComponentSummaryComponent} from "../../../shared/finance-component-summary/finance-component-summary.component";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {EmptyStateComponent, YesNoMarkComponent} from "../../../shared";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../../shared/utils/sort-utils";
import {SortRowsPipe} from "../../../shared/sort-rows/sort-rows.pipe";

@Component({
    selector: 'cost-list',
    templateUrl: './cost-list.component.html',
    styleUrl: './cost-list.component.less',
    standalone: true,
    imports: [SortRowsPipe, FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe, DatePipe, EmptyStateComponent, YesNoMarkComponent]
})
export class CostListComponent implements OnChanges {
    // "Add cost" under the summary figures; the shell opens the dialog
    @Output()
    add = new EventEmitter<void>();

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: Cost, field: string): SortValue => {
        switch (field) {
            case 'category':
                return this.getCostCategoryLabel(row.categoryId);
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }
    costs: Array<Cost> | null = [];
    @Input()
    projectId: number = 0;
    @Input()
    costCategories: ConfigurationEntry[] | null = [];
    @Input()
    projectCostsData!: CostProjectData;

    projectCostsSummaryForm!: FormGroup<FinanceObjectSummaryForm>;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.projectCostsSummaryForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['projectCostsData'] && this.projectCostsData) {
            this.fillFormData();
        }
    }

    // Empty until the configuration has the category, never the bare id
    getCostCategoryLabel(categoryId: number | undefined): string {
        return resolveKnownLabel(categoryId, this.costCategories);
    }

    private fillFormData(): void {
        if (isUndefinedOrEmpty(this.projectCostsData) || !this.projectCostsSummaryForm) {
            return;
        }

        let paidCount = this.projectCostsData.costs!.filter(cost => {
            return cost.paid
        }).length;

        this.projectCostsSummaryForm.patchValue({
            count: this.projectCostsData.financialData?.count,
            paid: paidCount,
            netValue: this.projectCostsData.financialData?.netValue,
            grossValue: this.projectCostsData.financialData?.grossValue,
            incomeTax: this.projectCostsData.financialData?.incomeTax,
            vatTax: this.projectCostsData.financialData?.vatTax,
        })
    }
}
