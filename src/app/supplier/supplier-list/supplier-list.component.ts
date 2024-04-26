import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {getSuppliers, getSuppliersNeedRefresh, loadSuppliers, SupplierState} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationState, getSupplierTypeConfiguration} from "../../shared/configuration/state";
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
    supplierTypes: ConfigurationEntry[] = [];

    showAddComponent: boolean = false;

    constructor(private supplierStore: Store<SupplierState>, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.supplierStore.dispatch(loadSuppliers());
        this.suppliersSubscription$ = this.supplierStore.select(getSuppliers)
            .subscribe({
                next: (contractors: Supplier[]) => this.suppliers = contractors
            });
        this.configurationStore.select(getSupplierTypeConfiguration)
            .subscribe({
                next: (contractorTypes: ConfigurationEntry[]) => this.supplierTypes = contractorTypes
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
        return resolveLabel(category, this.supplierTypes);
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
