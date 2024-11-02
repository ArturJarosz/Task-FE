import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FormGroup} from "@angular/forms";
import {Contractor} from "../../../generated/models/contractor";

@Component({
    selector: 'contractor-job-list',
    templateUrl: './contractor-job-list.component.html',
    styleUrl: './contractor-job-list.component.less'
})
export class ContractorJobListComponent implements OnChanges {
    @Input()
    contractorsJobsProjectData!: ContractorJobProjectData;
    @Input()
    contractors!: Contractor[];

    contractorIdToContractorName!: Map<number, String>;
    contractorsJobsSummaryForm!: FormGroup<FinanceObjectSummaryForm>;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.contractorIdToContractorName = new Map(
            this.contractors.map(contractor => [contractor.id!, contractor.name!]));
        this.contractorsJobsSummaryForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['contractorsJobsProjectData'] && this.contractorsJobsSummaryForm) {
            this.fillFormData();
        }
    }

    private fillFormData(): void {
        if (!this.contractorsJobsSummaryForm || isUndefinedOrEmpty(this.contractorsJobsProjectData)) {
            return;
        }

        let paidCount = this.contractorsJobsProjectData?.contractorJobs!.filter(contractorJob => {
            return contractorJob.paid
        }).length;

        this.contractorsJobsSummaryForm.patchValue({
            count: this.contractorsJobsProjectData?.financialData?.count,
            paid: paidCount,
            netValue: this.contractorsJobsProjectData?.financialData?.netValue,
            grossValue: this.contractorsJobsProjectData?.financialData?.grossValue,
            incomeTax: this.contractorsJobsProjectData?.financialData?.incomeTax,
            vatTax: this.contractorsJobsProjectData?.financialData?.vatTax,
        });
    }
}
