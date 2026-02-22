import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Supplier} from "../../../generated/models/supplier";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FinanceComponentSummaryComponent} from "../../../shared/finance-component-summary/finance-component-summary.component";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {NgIf, CurrencyPipe} from "@angular/common";

@Component({
    selector: 'supply-list',
    templateUrl: './supply-list.component.html',
    styleUrl: './supply-list.component.less',
    standalone: true,
    imports: [FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, NgIf, CurrencyPipe]
})
export class SupplyListComponent implements OnChanges{
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
