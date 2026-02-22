import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import {resolveLabel} from "../../../shared/utils/label-utils";
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
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {NgIf, CurrencyPipe} from "@angular/common";

@Component({
    selector: 'cost-list',
    templateUrl: './cost-list.component.html',
    styleUrl: './cost-list.component.less',
    standalone: true,
    imports: [FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, NgIf, CurrencyPipe]
})
export class CostListComponent implements OnChanges {
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

    getCostCategoryLabel(category: string): string {
        return resolveLabel(category, this.costCategories);
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
