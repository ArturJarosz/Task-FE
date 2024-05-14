import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ClientStore} from "../state";
import {Client} from "../../generated/models/client";
import {ClientDto} from "../model/client";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'client-list-shell',
    templateUrl: './client-list-shell.component.html',
    styleUrl: './client-list-shell.component.less'
})
export class ClientListShellComponent implements OnInit{
    clientStore = inject(ClientStore);

    $clients: Signal<Client[]| null>= this.clientStore.clients!;
    $clientsNeedRefresh: Signal<boolean> = this.clientStore.clientsNeedRefresh!;

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$clientsNeedRefresh()) {
                this.clientStore.loadClients({});
            }
        })
    }

    ngOnInit(): void {
        this.clientStore.loadClients({});
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
