import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
    FinanceObjectSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../../project-financial-summary/form/project-financial-summary-form-provider";
import {isUndefinedOrEmpty} from "../../../shared/utils/data-validation-util";
import {FinanceComponentSummaryComponent} from "../../../shared/finance-component-summary/finance-component-summary.component";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {EmptyStateComponent, NotSetComponent, YesNoMarkComponent} from "../../../shared";
import {Installment} from "../../../generated/models/installment";
import {isDeposit} from "../installment-utils";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../../shared/utils/sort-utils";
import {SortRowsPipe} from "../../../shared/sort-rows/sort-rows.pipe";
import {ThreeStepSortDirective} from "../../../shared/sort-rows/three-step-sort.directive";

@Component({
    selector: 'installment-list',
    templateUrl: './installment-list.component.html',
    styleUrl: './installment-list.component.less',
    standalone: true,
    imports: [ThreeStepSortDirective, SortRowsPipe, FinanceComponentSummaryComponent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe, DatePipe, EmptyStateComponent, NotSetComponent, YesNoMarkComponent]
})
export class InstallmentListComponent implements OnChanges {
    // "Add installment" under the summary figures; the shell opens the dialog
    @Output()
    add = new EventEmitter<void>();

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: Installment, field: string): SortValue => {
        switch (field) {
            case 'for':
                return isDeposit(row) ? 'Deposit' : row.stageName;
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }
    @Input()
    installmentProjectData!: InstallmentProjectData;
    @Input()
    projectId: number = 0;

    installmentsDetailForm!: FormGroup<FinanceObjectSummaryForm>;
    // The deposit first, as it is paid before any stage
    installments: Installment[] = [];
    protected readonly isDeposit = isDeposit;

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.installmentsDetailForm = this.formProvider.getFinanceObjectSummaryForm();
        if (changes['installmentProjectData'] && this.installmentProjectData) {
            const installments = this.installmentProjectData.installments ?? [];
            this.installments = [...installments.filter(isDeposit), ...installments.filter(installment => !isDeposit(installment))];
            this.fillFormData();
        }
    }

    private fillFormData(): void {
        if (isUndefinedOrEmpty(this.installmentProjectData) || !this.installmentsDetailForm) {
            return;
        }

        let paidCount = this.installmentProjectData.installments!.filter(installment => {
            return installment.paid
        }).length;

        this.installmentsDetailForm.patchValue({
            count: this.installmentProjectData.financialData?.count,
            paid: paidCount,
            netValue: this.installmentProjectData.financialData?.netValue,
            grossValue: this.installmentProjectData.financialData?.grossValue,
            incomeTax: this.installmentProjectData.financialData?.incomeTax,
            vatTax: this.installmentProjectData.financialData?.vatTax,
        })
    }
}
