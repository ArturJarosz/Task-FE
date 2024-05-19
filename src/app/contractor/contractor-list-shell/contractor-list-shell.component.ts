import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {Contractor} from "../../generated/models/contractor";
import {ContractorStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ContractorDto} from "../model/contractor";
import {ConfirmationService} from "primeng/api";
import {Router} from "@angular/router";

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

    constructor(private confirmationService: ConfirmationService, private router: Router) {
        effect(() => {
            if (this.$contractorsNeedRefresh()) {
                this.contractorStore.loadContractors({});
            }
        });
    }

    ngOnInit(): void {
        this.contractorStore.loadContractors({});
    }

    onDeleteContractor($event: ContractorDto) {
        this.confirmationService.confirm({
            message: `Do you want to delete contractor ${$event.name}?`,
            header: `Confirm contractor delete ${$event.name}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.contractorStore.setContractorId($event.id);
                this.contractorStore.deleteContractor({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }
}
