import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ContractorContractorJobsData} from "../../generated/models/contractor-contractor-jobs-data";
import {Project} from "../../generated/models/project";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../finance/project-financial-summary/form/project-financial-summary-form-provider";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {isUndefinedOrEmpty} from "../../shared/utils/data-validation-util";
import {FinanceComponentSummaryComponent} from "../../shared/finance-component-summary/finance-component-summary.component";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {NgIf, CurrencyPipe} from "@angular/common";

@Component({
    selector: 'contractor-job-list',
    templateUrl: './contractor-job-list.component.html',
    styleUrl: './contractor-job-list.component.less',
    standalone: true,
    imports: [FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, NgIf, CurrencyPipe]
})
export class ContractorJobListComponent implements OnChanges {
    @Input() contractorJobsData!: ContractorContractorJobsData;
    @Input() projects!: Project[];

    contractorJobsSummaryForm!: FormGroup<FinanceObjectSummaryForm>;
    averageContractorJobsSummaryForm!: FormGroup<FinanceObjectSummaryForm>;
    projectNameById: Map<number, string> = new Map<number, string>();

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.contractorJobsSummaryForm = this.formProvider.getFinanceObjectSummaryForm();
        this.averageContractorJobsSummaryForm = this.formProvider.getFinanceObjectSummaryForm();
        if (this.contractorJobsData) {
            this.fillFormData();
            this.fillAverageFormData();
        }
        this.projectNameById = new Map<number, string>();
        this.projects.forEach(project => {
            this.projectNameById.set(project.id!, project.name!);
        })

    }

    private fillFormData() {
        if (isUndefinedOrEmpty(this.contractorJobsData) || !this.contractorJobsSummaryForm) {
            return
        }
        let paidCount = this.contractorJobsData.contractorJobs!.filter(job => job.paid).length;

        this.contractorJobsSummaryForm.patchValue({
            count: this.contractorJobsData.financialData?.count,
            paid: paidCount,
            netValue: this.contractorJobsData.financialData?.netValue,
            grossValue: this.contractorJobsData.financialData?.grossValue,
            incomeTax: this.contractorJobsData.financialData?.incomeTax,
            vatTax: this.contractorJobsData.financialData?.vatTax,
        })
    }

    private fillAverageFormData() {
        if (isUndefinedOrEmpty(this.contractorJobsData) || !this.averageContractorJobsSummaryForm) {
            return;
        }
        this.averageContractorJobsSummaryForm.patchValue({
            netValue: this.contractorJobsData.averageFinancialData?.netValue,
            grossValue: this.contractorJobsData.averageFinancialData?.grossValue,
            incomeTax: this.contractorJobsData.averageFinancialData?.incomeTax,
            vatTax: this.contractorJobsData.averageFinancialData?.vatTax,
        })
    }
}
