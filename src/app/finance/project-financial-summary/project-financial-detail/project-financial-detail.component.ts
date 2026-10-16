import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {Cost} from "../../../generated/models/cost";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {NgFor, NgIf, NgSwitch, NgSwitchCase, CurrencyPipe} from "@angular/common";
import {CostListShellComponent} from "../../cost/cost-list-shell/cost-list-shell.component";
import {InstallmentListShellComponent} from "../../installment/installment-list-shell/installment-list-shell.component";
import {SupplyListShellComponent} from "../../supply/supply-list-shell/supply-list-shell.component";
import {ContractorJobListShellComponent} from "../../contractor-job/contractor-job-list-shell/contractor-job-list-shell.component";
import {SupervisionShellComponent} from "../../supervision/supervision-shell/supervision-shell.component";

export interface FinanceTab {
    key: string;
    label: string;
}

export interface FinanceKpi {
    label: string;
    icon: string;
    value: number | undefined;
}

// Keys match the ?tab= query param used by the /projects/:projectId/<component> redirects
const FINANCE_TABS: FinanceTab[] = [
    {key: 'costs', label: 'Costs'},
    {key: 'installments', label: 'Installments'},
    {key: 'supplies', label: 'Supplies'},
    {key: 'contractorJobs', label: 'Contractor jobs'},
    {key: 'supervision', label: 'Supervision'},
];

@Component({
    selector: 'project-financial-detail',
    templateUrl: './project-financial-detail.component.html',
    styleUrl: './project-financial-detail.component.less',
    standalone: true,
    imports: [CostListShellComponent, InstallmentListShellComponent, SupplyListShellComponent, ContractorJobListShellComponent, SupervisionShellComponent, NgFor, NgIf, NgSwitch, NgSwitchCase, RouterLink, CurrencyPipe]
})
export class ProjectFinancialDetailComponent implements OnInit {
    @Input()
    projectName!: string;
    @Input()
    projectId!: number;
    @Input()
    projectFinancialSummary!: TotalProjectFinancialSummary | null;
    @Input()
    costs!: Cost[] | null;

    readonly tabs = FINANCE_TABS;
    selectedTab: string = FINANCE_TABS[0].key;

    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);

    get kpis(): FinanceKpi[] {
        return [
            {label: 'Gross value', icon: 'pi pi-wallet', value: this.projectFinancialSummary?.grossValue},
            {label: 'Net value', icon: 'pi pi-money-bill', value: this.projectFinancialSummary?.netValue},
            {label: 'Income tax', icon: 'pi pi-percentage', value: this.projectFinancialSummary?.incomeTax},
            {label: 'VAT', icon: 'pi pi-receipt', value: this.projectFinancialSummary?.vatTax},
        ];
    }

    ngOnInit(): void {
        this.route.queryParams
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => this.selectedTab = this.resolveTab(params['tab']));
    }

    resolveTab(tabName: string | undefined): string {
        let tab = this.tabs.find(tab => tab.key.toLowerCase() === tabName?.toLowerCase());
        return tab ? tab.key : this.tabs[0].key;
    }
}
