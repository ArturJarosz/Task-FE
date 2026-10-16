import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CostStore} from "../state";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {ProjectStore} from "../../../project/state";

import {CostDetailComponent} from "../cost-detail/cost-detail.component";

@Component({
    selector: 'cost-detail-shell',
    templateUrl: './cost-detail-shell.component.html',
    styleUrl: './cost-detail-shell.component.less',
    standalone: true,
    imports: [CostDetailComponent]
})
export class CostDetailShellComponent implements OnInit {
    projectId: number = 0;
    costId: number = 0;

    readonly costStore = inject(CostStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly projectStore = inject(ProjectStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;
    // While the store still holds a cost from another page, show skeletons instead of the wrong one
    $cost: Signal<Cost | null> = computed(() => this.costStore.cost()?.id === this.costId ? this.costStore.cost() : null);
    $costLoadFailed: Signal<boolean> = this.costStore.costLoadFailed;
    // Breadcrumb only
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeCostId = this.route.snapshot.paramMap.get('costId');
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.costId = Number(maybeCostId);
        this.projectId = Number(maybeProjectId);
        this.costStore.setProjectId(this.projectId);
        this.costStore.setCostId(this.costId);

        this.configurationStore.loadConfiguration({});
        this.costStore.loadCost({});
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
    }

    updateCost($event: Cost) {
        this.costStore.updateCost({cost: $event});
    }

    onReload(): void {
        this.costStore.loadCost({});
    }
}
