import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {SupplyStore} from "../state/supply.state";
import {ActivatedRoute, Router} from "@angular/router";
import {Supply} from "../../../generated/models/supply";
import {ConfirmationService} from "primeng/api";
import {SupplierStore} from "../../../supplier/state";
import {Supplier} from "../../../generated/models/supplier";

@Component({
    selector: 'supply-detail-shell',
    templateUrl: './supply-detail-shell.component.html',
    styleUrl: './supply-detail-shell.component.less'
})
export class SupplyDetailShellComponent implements OnInit {
    projectId: number = 0;
    supplyId: number = 0;

    readonly supplyStore = inject(SupplyStore);
    readonly supplierStore = inject(SupplierStore);
    $supply: Signal<Supply> = this.supplyStore.supply;
    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {
        effect(() => {
            if (this.supplyStore.supplyNeedsRefresh() && this.supplyStore.projectId() && this.supplyStore.supplyId()) {
                this.supplyStore.loadSupply({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.params['projectId'];
        let maybeSupplyId = this.route.snapshot.params['supplyId'];

        this.projectId = Number(maybeProjectId);
        this.supplyId = Number(maybeSupplyId);

        this.supplyStore.setProjectId(this.projectId);
        this.supplyStore.setSupplyId(this.supplyId);

        this.supplyStore.loadSupply({});
        this.supplierStore.loadSuppliers({});
    }

    updateSupply($event: Supply): void {
        this.supplyStore.updateSupply({supply: $event});
    }

    deleteSupply($event: { supplyId: number, supplyName: string }): void {
        this.confirmationService.confirm({
            message: `Do you want to delete supply ${$event.supplyName}?`,
            header: `Confirm supply delete`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.supplyStore.deleteSupply({});
                this.router.navigate([`/projects/${this.projectId}/finance`], {queryParams: {tab: 'supplies'}});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
