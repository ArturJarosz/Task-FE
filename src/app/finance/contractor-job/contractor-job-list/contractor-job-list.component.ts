import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Contractor} from "../../../generated/models/contractor";
import {FinanceComponentSummaryComponent} from "../../../shared/finance-component-summary/finance-component-summary.component";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe} from "@angular/common";
import {EmptyStateComponent, YesNoMarkComponent} from "../../../shared";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../../shared/utils/sort-utils";
import {ContractorJob} from "../../../generated/models/contractor-job";
import {SortRowsPipe} from "../../../shared/sort-rows/sort-rows.pipe";
import {ThreeStepSortDirective} from "../../../shared/sort-rows/three-step-sort.directive";

@Component({
    selector: 'contractor-job-list',
    templateUrl: './contractor-job-list.component.html',
    styleUrl: './contractor-job-list.component.less',
    standalone: true,
    imports: [ThreeStepSortDirective, SortRowsPipe, FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe, EmptyStateComponent, YesNoMarkComponent]
})
export class ContractorJobListComponent implements OnChanges {
    // "Add contractor job" under the summary figures; the shell opens the dialog
    @Output()
    add = new EventEmitter<void>();

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: ContractorJob, field: string): SortValue => {
        switch (field) {
            case 'contractor':
                return String(this.contractorIdToContractorName?.get(row.contractorId!) ?? '');
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
