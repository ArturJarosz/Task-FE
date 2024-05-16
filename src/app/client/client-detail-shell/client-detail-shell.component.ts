import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {Client} from "../../generated/models/client";
import {ActivatedRoute} from "@angular/router";
import {ClientStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'client-detail-shell',
    templateUrl: './client-detail-shell.component.html',
    styleUrl: './client-detail-shell.component.less'
})
export class ClientDetailShellComponent implements OnInit {
    readonly clientStore = inject(ClientStore);
    readonly configurationStore = inject(ConfigurationStore);

    $client: Signal<Client | null> = this.clientStore.client!;
    $clientNeedsRefresh: Signal<boolean> = this.clientStore.clientNeedsRefresh!;
    $clientTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.clientTypes;

    constructor(private route: ActivatedRoute) {
        effect(() => {
            if (this.$clientNeedsRefresh()) {
                this.clientStore.loadClient({});
            }
        });
    }

    ngOnInit(): void {
        let maybeClientId = this.route.snapshot.paramMap.get("id");
        let clientId = Number(maybeClientId);
        this.clientStore.setClientId(clientId);
        this.clientStore.loadClient({});
        this.configurationStore.loadConfiguration({});
    }

    onUpdate($event: Client) {
        this.clientStore.updateClient({client: $event});
    }
}
