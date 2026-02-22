import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
    ProjectFinancialSummaryForm,
    ProjectFinancialSummaryFormProvider
} from "../form/project-financial-summary-form-provider";
import {Cost} from "../../../generated/models/cost";
import {TabView, TabViewChangeEvent, TabViewModule} from "primeng/tabview";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {WrapperComponent} from "../../../shared/wrapper/wrapper.component";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {ButtonModule} from "primeng/button";
import {NgIf, CurrencyPipe} from "@angular/common";
import {CostListShellComponent} from "../../cost/cost-list-shell/cost-list-shell.component";
import {InstallmentListShellComponent} from "../../installment/installment-list-shell/installment-list-shell.component";
import {SupplyListShellComponent} from "../../supply/supply-list-shell/supply-list-shell.component";
import {ContractorJobListShellComponent} from "../../contractor-job/contractor-job-list-shell/contractor-job-list-shell.component";
import {SupervisionShellComponent} from "../../supervision/supervision-shell/supervision-shell.component";

@Component({
    selector: 'project-financial-detail',
    templateUrl: './project-financial-detail.component.html',
    styleUrl: './project-financial-detail.component.less',
    standalone: true,
    imports: [WrapperComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, TabViewModule, CostListShellComponent, InstallmentListShellComponent, SupplyListShellComponent, ContractorJobListShellComponent, SupervisionShellComponent, ReactiveFormsModule, NgIf, ButtonModule, RouterLink, CurrencyPipe]
})
export class ProjectFinancialDetailComponent implements OnInit, OnChanges, AfterViewInit {
    @Input()
    projectName!: string;
    @Input()
    projectId!: number;
    @Input()
    projectFinancialSummary!: TotalProjectFinancialSummary | null;
    @Input()
    costs!: Cost[] | null;

    @ViewChild('financeObjects')
    tabView!: TabView;

    projectFinancialDetailForm!: FormGroup<ProjectFinancialSummaryForm>;
    selectedTabIndex: number = 0;
    title: string = "Project financial details";

    constructor(private formProvider: ProjectFinancialSummaryFormProvider, private route: ActivatedRoute,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.projectFinancialDetailForm = this.formProvider.getProjectFinancialSummaryForm();
        this.fillFormData();
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

    ngAfterViewInit(): void {
        this.route.queryParams.subscribe(params => {
            this.selectedTabIndex = this.getTabIndex(params["tab"]);
            this.cdr.detectChanges()
        });
    }

    getTabIndex(tabName: string): number {
        if (!tabName) {
            return 0;
        }

        let selectedIndex = this.tabView.tabs.findIndex(
            tab => {
                return tab.header.toLowerCase().replace(" ", "") === tabName.toLowerCase()
            }
        )

        if (selectedIndex > -1) {
            return selectedIndex;
        }

        return 0;
    }

    onTabChange(tabViewChangeEvent: TabViewChangeEvent) {
        this.selectedTabIndex = tabViewChangeEvent.index;
    }

}
