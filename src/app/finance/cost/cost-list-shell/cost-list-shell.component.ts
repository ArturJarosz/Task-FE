import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ConfigurationEntry} from "../../../shared/configuration/model/configuration";
import {Store} from "@ngrx/store";
import {ConfigurationState, getCostCategories} from "../../../shared/configuration/state";
import {Cost} from "../../model/finance";

@Component({
    selector: 'cost-list-shell',
    templateUrl: './cost-list-shell.component.html',
    styleUrl: './cost-list-shell.component.less'
})
export class CostListShellComponent implements OnInit {
    @Input()
    projectId: number = 0;
    @Input()
    costs: Cost[] | null = [];
    @Input()
    costCategories$!: Observable<ConfigurationEntry[]>;

    constructor(private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.costCategories$ = this.configurationStore.select(getCostCategories);
    }
}
