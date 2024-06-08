import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {FormGroup} from "@angular/forms";
import {
    ProjectFinancialSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../form/project-financial-summary-form-provider";
import {Cost} from "../../../generated/models/cost";

@Component({
    selector: 'project-financial-detail',
    templateUrl: './project-financial-detail.component.html',
    styleUrl: './project-financial-detail.component.less'
})
export class ProjectFinancialDetailComponent implements OnInit, OnChanges {
    @Input()
    projectName!: string;
    @Input()
    projectId!: number;
    @Input()
    projectFinancialSummary!: TotalProjectFinancialSummary | null;
    @Input()
    costs!: Cost[] | null;

    projectFinancialDetailForm!: FormGroup<ProjectFinancialSummaryForm>;

    title: string = "Project financial details";

    constructor(private formProvider: ProjectFinancialSummaryFormProvider) {
    }

    ngOnInit(): void {
        this.projectFinancialDetailForm = this.formProvider.getProjectFinancialSummaryForm();
    }

    ngOnChanges({projectFinancialSummary}: SimpleChanges): void {
        if (projectFinancialSummary && this.projectFinancialSummary) {
            this.fillFormData();
        }
    }

    private fillFormData(): void {
        if (!this.projectFinancialSummary) {
            return;
        }
        if (!this.projectFinancialDetailForm) {
            return;
        }

        this.projectFinancialDetailForm.patchValue({
            netValue: this.projectFinancialSummary.netValue,
            grossValue: this.projectFinancialSummary.grossValue,
            incomeTax: this.projectFinancialSummary.incomeTax,
            vatTax: this.projectFinancialSummary.vatTax,
        })
    }
}
