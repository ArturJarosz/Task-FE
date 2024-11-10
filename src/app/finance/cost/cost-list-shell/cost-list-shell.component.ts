import {Component, effect, inject, Input, OnInit, Signal} from '@angular/core';
import {ConfigurationStore} from "../../../shared/configuration/state";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {CostStore} from "../state";
import {CostProjectData} from "../../../generated/models/cost-project-data";

@Component({
    selector: 'cost-list-shell',
    templateUrl: './cost-list-shell.component.html',
    styleUrl: './cost-list-shell.component.less'
})
export class CostListShellComponent implements OnInit{
    @Input()
    projectId: number = 0;
    @Input()
    costs: Array<Cost> | null = [];

    readonly configurationStore = inject(ConfigurationStore);
    readonly costStore = inject(CostStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;
    $projectCostsData: Signal<CostProjectData> = this.costStore.projectCostsData;
    $costsNeedRefresh: Signal<boolean> = this.costStore.costsNeedRefresh;

    showAddCostComponent: boolean = false;

    constructor() {
        effect(() => {
            if (this.$costsNeedRefresh()) {
                this.costStore.loadCostsProjectData({});
            }
        });
    }

    onClickAdd() {
        this.showAddCostComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddCostComponent = false;
    }

    ngOnInit(): void {
        this.costStore.setProjectId(this.projectId);
        this.costStore.loadCostsProjectData({});
    }
}
