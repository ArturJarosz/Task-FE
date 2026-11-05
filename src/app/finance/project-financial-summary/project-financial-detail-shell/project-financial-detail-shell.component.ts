import {Component, computed, effect, inject, OnInit, Signal, untracked} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FinancialDataStore} from "../state/financial-data.state";
import {TotalProjectFinancialSummary} from "../../../generated/models/total-project-financial-summary";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {CostStore} from "../../cost";
import {Cost} from "../../../generated/models/cost";
import {ProjectStore, ProjectTimeSummaryStore} from "../../../project/state";
import {ProjectFinancialDetailComponent} from "../project-financial-detail/project-financial-detail.component";

@Component({
    selector: 'project-financial-detail-shell',
    templateUrl: './project-financial-detail-shell.component.html',
    styleUrl: './project-financial-detail-shell.component.less',
    standalone: true,
    imports: [ProjectFinancialDetailComponent]
})
export class ProjectFinancialDetailShellComponent implements OnInit {
    projectId: number = 0;

    readonly configurationStore = inject(ConfigurationStore);
    readonly financialStore = inject(FinancialDataStore);
    readonly costStore = inject(CostStore);
    readonly projectStore = inject(ProjectStore);
    readonly timeSummaryStore = inject(ProjectTimeSummaryStore);

    $projectFinancialSummary: Signal<TotalProjectFinancialSummary | null> = this.financialStore.projectFinancialSummary!;
    $projectFinancialSummaryNeedsRefresh: Signal<boolean> = this.financialStore.projectFinancialSummaryNeedsRefresh!;
    $costs: Signal<Cost[]> = this.costStore.costs!;
    $costsNeedRefresh: Signal<boolean> = this.costStore.costsNeedRefresh!;
    $projectName: Signal<string> = this.projectStore.projectName!;
    // Not set while no time is logged on the project
    $netValuePerHour: Signal<number | undefined> = computed(() => this.timeSummaryStore.timeSummary()?.netValuePerHour);
    $timeSummaryLoading: Signal<boolean> = this.timeSummaryStore.timeSummaryLoading;
    $timeSummaryLoadFailed: Signal<boolean> = this.timeSummaryStore.timeSummaryLoadFailed;

    showAddSupervisionDialog: boolean = false;

    constructor(private route: ActivatedRoute) {
        effect(() => {
            if (this.$projectFinancialSummaryNeedsRefresh()) {
                this.financialStore.loadProjectFinancialSummary({});
                // The net value per hour divides the net value, so it changes with it
                untracked(() => this.timeSummaryStore.setTimeSummaryNeedsRefresh());
            }
            if (this.$costsNeedRefresh()) {
                this.costStore.loadCostsProjectData({});
            }
        });
        effect(() => {
            if (this.timeSummaryStore.timeSummaryNeedsRefresh()) {
                untracked(() => this.timeSummaryStore.loadTimeSummary());
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.projectId = Number(maybeProjectId);
        this.financialStore.setProjectId(this.projectId);
        this.financialStore.loadProjectFinancialSummary({});
        this.timeSummaryStore.setProjectId(this.projectId);
        // Time logged on tasks changes it too, so it is loaded again on every visit
        this.timeSummaryStore.setTimeSummaryNeedsRefresh();
        this.configurationStore.loadConfiguration({});
        this.costStore.setProjectId(this.projectId);
        this.costStore.loadCostsProjectData({});
    }
}
