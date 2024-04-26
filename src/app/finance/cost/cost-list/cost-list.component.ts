import {Component, Input} from '@angular/core';

import {resolveLabel} from "../../../shared/utils/label-utils";
import {Cost} from "../../../generated/models/cost";
import {ConfigurationEntry} from "../../../generated/models/configuration-entry";

@Component({
    selector: 'cost-list',
    templateUrl: './cost-list.component.html',
    styleUrl: './cost-list.component.less'
})
export class CostListComponent {
    @Input()
    costs: Array<Cost> | null = [];
    @Input()
    projectId: number = 0;
    @Input()
    costCategories: ConfigurationEntry[] | null = [];

    getCostCategoryLabel(category: string): string {
        return resolveLabel(category, this.costCategories);
    }

}
