import {Component, OnDestroy, OnInit} from '@angular/core';
import {Client, ClientType} from "../client";
import {ClientRestService} from "../service/client-rest.service";
import {Subscription} from "rxjs";
import {ConfirmationService, MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

@Component({
    selector: 'clients-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less']
})
export class ClientListComponent implements OnInit, OnDestroy {
    private clientSubscription!: Subscription;
    protected readonly ClientType = ClientType;
    showComponent: boolean = false;

    errorMessage: string = '';
    clients: Client[] = [];

    constructor(private clientService: ClientRestService, private confirmationService: ConfirmationService, private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.clientSubscription = this.clientService.getClients()
            .subscribe({
                next: clients => this.clients = clients,
                error: error => this.errorMessage = error
            });
    }

    ngOnDestroy(): void {
        this.clientSubscription.unsubscribe();
    }

    onClick() {
        this.showComponent = !this.showComponent;
    }

    deleteClientClick(event: MouseEvent, client: Client) {
        // stop propagating row event
        event.stopPropagation();
        let name = client.clientType === ClientType.PRIVATE ? `${client.firstName} ${client.lastName}` : `${client.companyName}`;
        this.confirmationService.confirm({
            message: `Do you want to delete client: ${name}?`,
            header: `Confirm client delete ${name}.`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.clientService.deleteClient(client.id!)
                    .subscribe({
                        next: value => {
                            this.confirmationService.close();
                            this.messageService.add({
                                severity: MessageSeverity.SUCCESS,
                                summary: 'Client removed.',
                                detail: `Client ${name} was successfully removed.`
                            })
                        }
                    })
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }
}
