import {Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ContractorDto} from "../model/contractor";
import {WrapperComponent} from "../../shared/wrapper/wrapper.component";
import {AddContractorComponent} from "../add-contractor/add-contractor.component";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AvatarModule} from "primeng/avatar";

@Component({
    selector: 'contractor-list',
    templateUrl: './contractor-list.component.html',
    styleUrls: ['./contractor-list.component.less'],
    standalone: true,
    imports: [WrapperComponent, AddContractorComponent, TableModule, ButtonModule, RouterLink, AvatarModule]
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

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.contractorTypes);
    }

    onClick() {
        this.showAddContractorComponent = true;
    }

    onNotify($event: boolean) {
        this.showAddContractorComponent = false;
    }

    getContractorInitials(name: string): string {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        return words.slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
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
