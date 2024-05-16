import {Component, inject, Input, Signal} from '@angular/core';
import {ConfigurationStore} from "../../../shared/configuration/state";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";

@Component({
    selector: 'cost-list-shell',
    templateUrl: './cost-list-shell.component.html',
    styleUrl: './cost-list-shell.component.less'
})
export class CostListShellComponent {
    @Input()
    projectId: number = 0;
    @Input()
    costs: Array<Cost> | null = [];

    readonly configurationStore = inject(ConfigurationStore);
    $costCategories: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.costCategories;

    showAddCostComponent: boolean = false;

    onClick() {
        this.showAddCostComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddCostComponent = false;
    }
}
