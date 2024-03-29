import {Component, OnDestroy, OnInit} from '@angular/core';
import {ContractorState, getContractors, loadContractors} from "../state";
import {Store} from "@ngrx/store";
import {Subscription} from "rxjs";
import {Contractor} from "../model/contractor";
import {ConfigurationState, getContractorTypeConfiguration} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

@Component({
    selector: 'app-contractor-list',
    templateUrl: './contractor-list.component.html',
    styleUrls: ['./contractor-list.component.less']
})
export class ContractorListComponent implements OnInit, OnDestroy {
    private contractorsSubscription!: Subscription;
    contractors: Contractor[] = [];
    pageTitle = "Contractors";
    contractorTypes: ConfigurationEntry[] = [];

    constructor(private contractorState: Store<ContractorState>, private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.contractorState.dispatch(loadContractors());
        this.contractorsSubscription = this.contractorState.select(getContractors)
            .subscribe({
                next: contractors => this.contractors = contractors
            });
        this.configurationStore.select(getContractorTypeConfiguration)
            .subscribe({
                next: contractorTypes => this.contractorTypes = contractorTypes
            })
    }

    ngOnDestroy(): void {
        this.contractorsSubscription.unsubscribe();
    }

    getLabelFromCategory(category: string): string {
        let maybeLabel = this.contractorTypes.find(element => element.id === category)?.label;
        return maybeLabel ? maybeLabel : category;
    }
}
