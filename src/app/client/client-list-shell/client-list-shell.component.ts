import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ClientStore} from "../state";
import {Client} from "../../generated/models/client";
import {ClientDto} from "../model/client";
import {ConfirmationService} from "primeng/api";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'client-list-shell',
    templateUrl: './client-list-shell.component.html',
    styleUrl: './client-list-shell.component.less'
})
export class ClientListShellComponent implements OnInit{
    readonly clientStore = inject(ClientStore);
    readonly configurationStore = inject(ConfigurationStore);

    $clients: Signal<Client[]| null>= this.clientStore.clients!;
    $clientsNeedRefresh: Signal<boolean> = this.clientStore.clientsNeedRefresh!;
    $clientTypes :Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.clientTypes;

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$clientsNeedRefresh()) {
                this.clientStore.loadClients({});
            }
        })
    }

    ngOnInit(): void {
        this.clientStore.loadClients({});
        this.configurationStore.loadConfiguration({});
    }

    onDeleteClient($event: ClientDto) {
        this.clientStore.setClientId($event.id);
        this.confirmationService.confirm({
            message: `Do you want to delete client: ${$event.name}?`,
            header: `Confirm client delete ${$event.name}.`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.clientStore.deleteClient({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

}
