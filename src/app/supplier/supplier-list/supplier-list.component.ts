import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {Supplier} from "../model/supplier";
import {getSuppliers, loadSuppliers, SupplierState} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationState, getSupplierTypeConfiguration} from "../../shared/configuration/state";
import {loadContractors} from "../../contractor/state";

@Component({
    selector: 'app-supplier-list',
    templateUrl: './supplier-list.component.html',
    styleUrls: ['./supplier-list.component.less']
})
export class SupplierListComponent implements OnInit, OnDestroy {
    private suppliersSubscription!: Subscription;
    suppliers: Supplier[] = [];
    pageTitle = "Suppliers";
    supplierTypes: ConfigurationEntry[] = [];

    constructor(private supplierStore: Store<SupplierState>, private configurationStore: Store<ConfigurationState>) {
        this.supplierStore.dispatch(loadSuppliers());
        this.suppliersSubscription = this.supplierStore.select(getSuppliers)
            .subscribe({
                next: contractors => this.suppliers = contractors
            });
        this.configurationStore.select(getSupplierTypeConfiguration)
            .subscribe({
                next: contractorTypes => this.supplierTypes = contractorTypes
            })
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.suppliersSubscription.unsubscribe();
    }

    getLabelFromCategory(category: string): string {
        let maybeLabel = this.supplierTypes.find(element => element.id === category)?.label;
        return maybeLabel ? maybeLabel : category;
    }

}
