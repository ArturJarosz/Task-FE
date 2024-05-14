import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {Client} from "../../generated/models/client";
import {ActivatedRoute} from "@angular/router";
import {ClientStore} from "../state";

@Component({
    selector: 'client-detail-shell',
    templateUrl: './client-detail-shell.component.html',
    styleUrl: './client-detail-shell.component.less'
})
export class ClientDetailShellComponent implements OnInit {
    clientStore = inject(ClientStore);

    $client: Signal<Client | null> = this.clientStore.client!;
    $clientNeedsRefresh: Signal<boolean> = this.clientStore.clientNeedsRefresh!;

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
    }

}
