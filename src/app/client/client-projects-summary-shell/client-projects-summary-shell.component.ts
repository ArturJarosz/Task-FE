import {Component, effect, inject, OnInit, Signal} from '@angular/core';

import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ClientStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";

@Component({
    selector: 'client-projects-summary-shell',
    templateUrl: './client-projects-summary-shell.component.html',
    styleUrl: './client-projects-summary-shell.component.less'
})
export class ClientProjectsSummaryShellComponent implements OnInit{
    readonly clientStore = inject(ClientStore);
    readonly configurationStore = inject(ConfigurationStore);

    $clientNeedsRefresh: Signal<boolean> = this.clientStore.clientNeedsRefresh!;
    $clientProjectsSummary: Signal<EntityProjectsSummary | null> = this.clientStore.clientProjectsSummary!;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;

    constructor() {
        effect(() => {
            if (this.$clientNeedsRefresh()) {
                this.clientStore.loadClientProjectsSummary({});
            }
        });
    }

    ngOnInit(): void {
        this.clientStore.loadClientProjectsSummary({});
    }

}
