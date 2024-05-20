import {Component, Input} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'supplier-list',
    templateUrl: './supplier-list.component.html',
    styleUrls: ['./supplier-list.component.less']
})
export class SupplierListComponent {
    pageTitle = "Suppliers";

    @Input()
    suppliers!: Supplier[];
    @Input()
    supplierTypes!: ConfigurationEntry[];

    showAddComponent: boolean = false;

    constructor() {
    }

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.supplierTypes);
    }

    onClick() {
        this.showAddComponent = true;
    }

    onNotify($event: boolean) {
        this.showAddComponent = false;
    }
}
