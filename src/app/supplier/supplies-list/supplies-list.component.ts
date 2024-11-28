import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SupplierSuppliesData} from "../../generated/models/supplier-supplies-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";
import {FormGroup} from "@angular/forms";
import {isUndefinedOrEmpty} from "../../shared/utils/data-validation-util";
import {Project} from "../../generated/models/project";

@Component({
    selector: 'supplier-supplies-list',
    templateUrl: './supplies-list.component.html',
    styleUrl: './supplies-list.component.less'
})
export class SuppliesListComponent implements OnChanges {
    @Input() supplierSuppliesData!: SupplierSuppliesData;
    @Input() projects!: Project[];

    suppliesSummaryForm!: FormGroup<FinanceObjectSummaryForm>;
    averageSuppliesSummaryForm!: FormGroup<FinanceObjectSummaryForm>;
    projectNameById: Map<number, string> = new Map<number, string>();

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.suppliesSummaryForm = this.formProvider.getFinanceObjectSummaryForm();
        this.averageSuppliesSummaryForm = this.formProvider.getFinanceObjectSummaryForm();
        if (this.supplierSuppliesData) {
            this.fillFormData();
            this.fillAverageFormData();
        }
        this.projectNameById = new Map<number, string>();
        this.projects.forEach(project => {
            this.projectNameById.set(project.id!, project.name!);
        })
    }

    private fillFormData() {
        console.log("filling form data")
        if (isUndefinedOrEmpty(this.supplierSuppliesData) || !this.suppliesSummaryForm) {
            return;
        }
        console.log("filling data")
        let paidCount = this.supplierSuppliesData.supplies!.filter(supply => {
            return supply.paid
        }).length;

        this.suppliesSummaryForm.patchValue({
            count: this.supplierSuppliesData.financialData?.count,
            paid: paidCount,
            netValue: this.supplierSuppliesData.financialData?.netValue,
            grossValue: this.supplierSuppliesData.financialData?.grossValue,
            incomeTax: this.supplierSuppliesData.financialData?.incomeTax,
            vatTax: this.supplierSuppliesData.financialData?.vatTax,
        })
    }

    private fillAverageFormData() {
        console.log("filling average form data")
        if (isUndefinedOrEmpty(this.supplierSuppliesData) || !this.averageSuppliesSummaryForm) {
            return;
        }
        console.log("filling average data")
        this.averageSuppliesSummaryForm.patchValue({
            netValue: this.supplierSuppliesData.averageFinancialData?.netValue,
            grossValue: this.supplierSuppliesData.averageFinancialData?.grossValue,
            incomeTax: this.supplierSuppliesData.averageFinancialData?.incomeTax,
            vatTax: this.supplierSuppliesData.averageFinancialData?.vatTax,
        })
    }

}
