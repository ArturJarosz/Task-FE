import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FinancialDataStore} from "../state/financial-data.state";
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {CostStore} from "../../cost/state";
import {Cost} from "../../../generated/models/cost";
import {ProjectStore} from "../../../project/state";

@Component({
    selector: 'project-financial-detail-shell',
    templateUrl: './project-financial-detail-shell.component.html',
    styleUrl: './project-financial-detail-shell.component.less'
})
export class ProjectFinancialDetailShellComponent implements OnInit {
    projectId: number = 0;

    readonly configurationStore = inject(ConfigurationStore);
    readonly financialStore = inject(FinancialDataStore);
    readonly costStore = inject(CostStore);
    readonly projectStore = inject(ProjectStore);
    $projectFinancialSummary: Signal<TotalProjectFinancialSummary | null> = this.financialStore.projectFinancialSummary!;
    $projectFinancialSummaryNeedsRefresh: Signal<boolean> = this.financialStore.projectFinancialSummaryNeedsRefresh!;
    $costs: Signal<Cost[]> = this.costStore.costs!;
    $costsNeedRefresh: Signal<boolean> = this.costStore.costsNeedRefresh!;
    $projectName: Signal<string> = this.projectStore.projectName!;

    constructor(private route: ActivatedRoute) {
        effect(() => {
            if (this.$projectFinancialSummaryNeedsRefresh()) {
                this.financialStore.loadProjectFinancialSummary({});
            }
            if (this.$costsNeedRefresh()) {
                this.costStore.loadCosts({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.projectId = Number(maybeProjectId);
        this.financialStore.setProjectId(this.projectId);
        this.financialStore.loadProjectFinancialSummary({});
        this.configurationStore.loadConfiguration({});
        this.costStore.setProjectId(this.projectId);
        this.costStore.loadCosts({});
    }

}
