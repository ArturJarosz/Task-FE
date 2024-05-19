import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {SupplierStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'supplier-list',
    templateUrl: './supplier-list.component.html',
    styleUrls: ['./supplier-list.component.less']
})
export class SupplierListComponent implements OnInit {
    pageTitle = "Suppliers";

    readonly supplierStore = inject(SupplierStore);
    readonly configurationStore = inject(ConfigurationStore);
    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;
    $suppliers: Signal<Supplier[]> = this.supplierStore.suppliers!;
    $suppliersNeedRefresh: Signal<boolean> = this.supplierStore.suppliersNeedRefresh!;

    showAddComponent: boolean = false;

    constructor() {
        effect(() => {
            if (this.$suppliersNeedRefresh()) {
                this.supplierStore.loadSuppliers({});
            }
        });
    }

    ngOnInit(): void {
        this.supplierStore.loadSuppliers({});
        this.configurationStore.loadConfiguration({});
    }

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.$supplierTypes());
    }

    onClick() {
        this.showAddComponent = true;
    }

    onNotify($event: boolean) {
        this.showAddComponent = false;
    }
}
