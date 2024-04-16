import {Component, Input} from '@angular/core';
import {Cost} from "../../module/finance";

@Component({
    selector: 'cost-list',
    templateUrl: './cost-list.component.html',
    styleUrl: './cost-list.component.less'
})
export class CostListComponent {
    @Input()
    costs: Cost[] | null = [];
}
