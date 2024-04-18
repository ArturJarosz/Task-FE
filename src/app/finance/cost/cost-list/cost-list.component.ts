import {Component, Input} from '@angular/core';
import {Cost} from "../../model/finance";
import {ConfigurationEntry} from "../../../shared/configuration/model/configuration";

@Component({
    selector: 'cost-list',
    templateUrl: './cost-list.component.html',
    styleUrl: './cost-list.component.less'
})
export class CostListComponent {
    @Input()
    costs: Cost[] | null = [];
    @Input()
    projectId: number = 0;
    @Input()
    costCategories: ConfigurationEntry[] | null = [];

    getCostCategoryLabel(category: string): string {
        let maybeLayer = this.costCategories?.find(entry => entry.id === category)?.label;
        return maybeLayer ? maybeLayer : category;
    }
}
