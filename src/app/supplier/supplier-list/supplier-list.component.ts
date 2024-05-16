import {Component, inject, OnDestroy, OnInit, Signal} from '@angular/core';
import {Subscription} from "rxjs";
import {getSuppliers, getSuppliersNeedRefresh, loadSuppliers, SupplierState} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationStore} from "../../shared/configuration/state";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Supplier} from "../../generated/models/supplier";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'supplier-list',
    templateUrl: './supplier-list.component.html',
    styleUrls: ['./supplier-list.component.less']
})
export class SupplierListComponent implements OnInit, OnDestroy {
    private suppliersSubscription$!: Subscription;
    private suppliersNeedRefreshSubscription$!: Subscription;

    suppliers: Supplier[] = [];
    pageTitle = "Suppliers";

    readonly configurationStore = inject(ConfigurationStore);
    $supplierTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.supplierTypes;

    showAddComponent: boolean = false;

    constructor(private supplierStore: Store<SupplierState>) {
    }

    ngOnInit(): void {
        this.supplierStore.dispatch(loadSuppliers());
        this.configurationStore.loadConfiguration({});
        this.suppliersSubscription$ = this.supplierStore.select(getSuppliers)
            .subscribe({
                next: (contractors: Supplier[]) => this.suppliers = contractors
            });
        this.suppliersNeedRefreshSubscription$ = this.supplierStore.select(getSuppliersNeedRefresh)
            .subscribe({
                next: (suppliersNeedRefresh) => {
                    if (suppliersNeedRefresh) {
                        this.refreshSuppliers();
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this.suppliersSubscription$.unsubscribe();
        this.suppliersNeedRefreshSubscription$.unsubscribe();
    }

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.$supplierTypes());
    }

    onClick() {
        this.showAddComponent = true;
    }

    private refreshSuppliers() {
        this.supplierStore.dispatch(loadSuppliers());
    }

    onNotify($event: boolean) {
        this.showAddComponent = false;
        this.refreshSuppliers();
    }
}
