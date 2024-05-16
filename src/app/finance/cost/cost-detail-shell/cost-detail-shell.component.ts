import {Component, inject, OnInit, Signal} from '@angular/core';
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {CostState, getCost, loadCost} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationStore} from "../../../shared/configuration/state";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";

@Component({
    selector: 'cost-detail-shell',
    templateUrl: './cost-detail-shell.component.html',
    styleUrl: './cost-detail-shell.component.less'
})
export class CostDetailShellComponent implements OnInit {
    cost$!: Observable<Cost | null>;

    projectId: number = 0;
    costId: number = 0;

    configurationStore = inject(ConfigurationStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;

    constructor(private route: ActivatedRoute, private costStore: Store<CostState>) {
    }

    ngOnInit(): void {
        let maybeCostId = this.route.snapshot.paramMap.get('costId');
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.costId = Number(maybeCostId);
        this.projectId = Number(maybeProjectId);
        this.costStore.dispatch(loadCost({projectId: this.projectId, costId: this.costId}));

        this.cost$ = this.costStore.select(getCost);
        this.configurationStore.loadConfiguration({});

    }

}
