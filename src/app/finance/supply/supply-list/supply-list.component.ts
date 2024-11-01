import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {FormGroup} from "@angular/forms";
import {Supplier} from "../../../generated/models/supplier";

@Component({
    selector: 'supply-list',
    templateUrl: './supply-list.component.html',
    styleUrl: './supply-list.component.less'
})
export class SupplyListComponent implements OnInit, OnChanges{
    @Input()
    supplyProjectData!: SupplyProjectData | null;
    @Input()
    suppliers! : Supplier[];
    supplierIdToSupplier! : Map<number, String>;

    supplyDataForm!: FormGroup<FinanceObjectSummaryForm>;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.supplyDataForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['supplyProjectData'] && this.supplyProjectData) {
            this.fillFormData();
        }
    }

    ngOnInit(): void {
        this.supplierIdToSupplier = new Map(this.suppliers.map(supplier => [supplier.id!, supplier.name!] as const));
    }

    private fillFormData(): void {
        if (!this.supplyDataForm || !this.supplyProjectData) {
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
