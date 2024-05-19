import {Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ContractorDto} from "../model/contractor";

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
    @Output()
    deleteContractorEvent: EventEmitter<ContractorDto> = new EventEmitter<ContractorDto>();

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

    onDeleteContractor($event: MouseEvent, contractor: Contractor) {
        $event.stopPropagation();
        let contractorDto: ContractorDto;
        contractorDto = {
            id: contractor.id!,
            name: contractor.name!,
        }
        this.deleteContractorEvent.emit(contractorDto);
    }
}
