import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Cost} from "../.././model/finance";
import {ConfigurationEntry} from "../../../shared/configuration/model/configuration";
import {ActivatedRoute} from "@angular/router";
import {CostState, getCost, loadCost} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationState, getCostCategories} from "../../../shared/configuration/state";

@Component({
    selector: 'cost-detail-shell',
    templateUrl: './cost-detail-shell.component.html',
    styleUrl: './cost-detail-shell.component.less'
})
export class CostDetailShellComponent implements OnInit {
    cost$!: Observable<Cost | null>;
    costCategories$!: Observable<ConfigurationEntry[]>;

    projectId: number = 0;
    costId: number = 0;

    constructor(private route: ActivatedRoute, private costStore: Store<CostState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        let maybeCostId = this.route.snapshot.paramMap.get('costId');
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.costId = Number(maybeCostId);
        this.projectId = Number(maybeProjectId);
        this.costStore.dispatch(loadCost({projectId: this.projectId, costId: this.costId}));

        this.cost$ = this.costStore.select(getCost);

        this.costCategories$ = this.configurationStore.select(getCostCategories);
    }

}
