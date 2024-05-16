import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {Client} from "../../generated/models/client";
import {ActivatedRoute, Router} from "@angular/router";
import {ClientStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ClientDto} from "../model/client";
import {ConfirmationService} from "primeng/api";

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

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
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

    onDelete($event: ClientDto) {
        this.confirmationService.confirm({
            message: `Do you want to delete client ${$event.name}?`,
            header: `Confirm deleting client ${$event.name}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.clientStore.setClientId($event.id);
                this.clientStore.deleteClient({clientId: $event.id});
                this.router.navigate([`/clients`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })

    }
}
