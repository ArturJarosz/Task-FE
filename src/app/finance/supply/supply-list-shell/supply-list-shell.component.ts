import {Component, effect, inject, Input, OnInit, Signal} from '@angular/core';
import {SupplyProjectData} from "../../../generated/models/supply-project-data";
import {Supplier} from "../../../generated/models/supplier";
import {SupplyStore} from "../state/supply.state";
import {SupplierStore} from "../../../supplier/state";

@Component({
    selector: 'supply-list-shell',
    templateUrl: './supply-list-shell.component.html',
    styleUrl: './supply-list-shell.component.less'
})
export class SupplyListShellComponent implements OnInit{
    @Input()
    projectId: number = 0;

    readonly supplyStore = inject(SupplyStore);
    readonly supplierStore = inject(SupplierStore);

    $suppliesNeedRefresh: Signal<boolean> = this.supplyStore.suppliesNeedRefresh!;
    $supplyProjectData: Signal<SupplyProjectData> = this.supplyStore.supplyProjectData!;
    $suppliersNeedRefresh: Signal<boolean> = this.supplierStore.suppliersNeedRefresh;
    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers;

    showAddSupplierComponent: boolean = false;

    constructor() {
        effect(() => {
            if (this.$suppliesNeedRefresh()) {
                this.supplyStore.loadProjectSupplies({});
            }
            if (this.$suppliersNeedRefresh()) {
                this.supplierStore.loadSuppliers({});
            }
        });
    }

    ngOnInit(): void {
        this.supplyStore.setProjectId(this.projectId);
        this.supplyStore.loadProjectSupplies({});
        this.supplierStore.loadSuppliers({});
    }

    onClickAdd() {
        this.showAddSupplierComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddSupplierComponent = false;
    }

}
