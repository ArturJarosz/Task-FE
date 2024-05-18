import {Component, Input} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'contractor-list',
    templateUrl: './contractor-list.component.html',
    styleUrls: ['./contractor-list.component.less']
})
export class ContractorListComponent {
    pageTitle = "Contractors";

    @Input()
    contractorTypes!: ConfigurationEntry[];
    @Input()
    contractors!: Contractor[];

    protected showAddContractorComponent: boolean = false;

    constructor() {
    }

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.contractorTypes);
    }

    onClick() {
        this.showAddContractorComponent = true;
    }

    onNotify($event: boolean) {
        this.showAddContractorComponent = false;
    }

}
