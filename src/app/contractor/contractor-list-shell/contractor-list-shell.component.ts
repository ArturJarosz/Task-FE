import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Contractor} from "../../generated/models/contractor";
import {ContractorStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";

@Component({
    selector: 'contractor-list-shell',
    templateUrl: './contractor-list-shell.component.html',
    styleUrl: './contractor-list-shell.component.less'
})
export class ContractorListShellComponent implements OnInit {

    readonly contractorStore = inject(ContractorStore)
    readonly configurationStore = inject(ConfigurationStore);

    $contractorTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractorTypes;
    $contractors: Signal<Contractor[]> = this.contractorStore.contractors!;
    $contractorsNeedRefresh: Signal<boolean> = this.contractorStore.contractorsNeedRefresh!;

    constructor() {
        effect(() => {
            if (this.$contractorsNeedRefresh()) {
                this.contractorStore.loadContractors({});
            }
        });
    }

    ngOnInit(): void {
        this.contractorStore.loadContractors({});
    }
}
