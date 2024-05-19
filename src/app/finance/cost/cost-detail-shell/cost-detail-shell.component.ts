import {Component, inject, OnInit, Signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CostStore} from "../state";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";

@Component({
    selector: 'cost-detail-shell',
    templateUrl: './cost-detail-shell.component.html',
    styleUrl: './cost-detail-shell.component.less'
})
export class CostDetailShellComponent implements OnInit {
    projectId: number = 0;
    costId: number = 0;

    readonly costStore = inject(CostStore);
    readonly configurationStore = inject(ConfigurationStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;
    $cost: Signal<Cost | null> = this.costStore.cost!;

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
    }
}
