import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ContractorStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ActivatedRoute, Router} from "@angular/router";
import {ContractorDto} from "../model/contractor";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'contractor-detail-shell',
    templateUrl: './contractor-detail-shell.component.html',
    styleUrl: './contractor-detail-shell.component.less'
})
export class ContractorDetailShellComponent implements OnInit {
    contractorId!: number;

    readonly contractorStore = inject(ContractorStore);
    readonly configurationStore = inject(ConfigurationStore);
    $contractor: Signal<Contractor | null> = this.contractorStore.contractor;
    $contractorNeedsRefresh: Signal<boolean> = this.contractorStore.contractorNeedsRefresh;
    $contractorTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractorTypes;

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
        effect(() => {
            if (this.$contractorNeedsRefresh()) {
                this.contractorStore.loadContractor({});
            }
        });
    }

    ngOnInit(): void {
        let maybeContractorId = this.route.snapshot.paramMap.get('contractorId');
        this.contractorId = Number(maybeContractorId);
        this.contractorStore.setContractorId(this.contractorId);

        this.contractorStore.loadContractor({});
    }

    onUpdateContractor($event: Contractor) {
        this.contractorStore.updateContractor({contractor: $event});
    }

    onDeleteContractor($event: ContractorDto) {
        this.confirmationService.confirm({
            message: `Do you want to delete contractor ${$event.name}?`,
            header: `Confirm deleting contractor ${$event.name}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                console.log("removing contractor confirmation")
                this.contractorStore.setContractorId($event.id);
                this.contractorStore.deleteContractor({});
                this.router.navigate([`/contractors`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }
}
