import {Component, OnDestroy, OnInit} from '@angular/core';
import {ContractorState, getContractors, getContractorsNeedRefresh, loadContractors} from "../state";
import {Store} from "@ngrx/store";
import {Subscription} from "rxjs";
import {ConfigurationState, getContractorTypeConfiguration} from "../../shared/configuration/state";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Contractor} from "../../generated/models/contractor";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'contractor-list',
    templateUrl: './contractor-list.component.html',
    styleUrls: ['./contractor-list.component.less']
})
export class ContractorListComponent implements OnInit, OnDestroy {
    private contractorsSubscription$!: Subscription;
    private contractorsNeedRefreshSubscription$!: Subscription;
    contractors: Contractor[] = [];
    pageTitle = "Contractors";
    contractorTypes!: ConfigurationEntry[];

    protected showAddContractorComponent: boolean = false;

    constructor(private contractorStore: Store<ContractorState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.contractorStore.dispatch(loadContractors());
        this.contractorsSubscription$ = this.contractorStore.select(getContractors)
            .subscribe({
                next: contractors => this.contractors = contractors
            });
        this.configurationStore.select(getContractorTypeConfiguration)
            .subscribe({
                next: contractorTypes => this.contractorTypes = contractorTypes
            });
        this.contractorsNeedRefreshSubscription$ = this.contractorStore.select(getContractorsNeedRefresh)
            .subscribe({
                next: (contractorsNeedRefresh) => {
                    if (contractorsNeedRefresh) {
                        this.refreshContractors();
                    }
                }
            })
    }

    ngOnDestroy(): void {
        this.contractorsSubscription$.unsubscribe();
    }

    getLabelFromCategory(category: string): string {
        return resolveLabel(category, this.contractorTypes);
    }

    onClick() {
        this.showAddContractorComponent = true;
    }

    private refreshContractors() {
        this.contractorStore.dispatch(loadContractors());
    }

    onNotify($event: boolean) {
        this.showAddContractorComponent = false;
        this.refreshContractors();
    }
}
