import {Component, OnDestroy, OnInit} from '@angular/core';
import {Client, ClientType} from "../model/client";
import {Subscription} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {Store} from "@ngrx/store";
import {ClientState, getClients, getClientsNeedRefresh, loadClients, removeClient} from "../state";
import {ConfigurationState, getClientTypeConfiguration} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

@Component({
    selector: 'clients-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less',]
})
export class ClientListComponent implements OnInit, OnDestroy {
    private clientSubscription!: Subscription;
    private clientsNeedsRefreshSubscription!: Subscription;
    private clientTypesSubscription!: Subscription;
    protected readonly ClientType = ClientType;
    showComponent: boolean = false;
    errorMessage: string = '';
    clients!: Client[];
    clientTypes: ConfigurationEntry[] = [];

    constructor(private confirmationService: ConfirmationService, private clientStore: Store<ClientState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.clientSubscription = this.clientStore.select(getClients)
            .subscribe({
                next: clients => {
                    this.clients = clients
                },
                error: error => this.errorMessage = error
            })
        this.clientStore.dispatch(loadClients());
        this.refreshClients();
        this.clientTypesSubscription = this.configurationStore.select(getClientTypeConfiguration)
            .subscribe({
                next: clientTypes => this.clientTypes = clientTypes
            })
        this.clientsNeedsRefreshSubscription = this.clientStore.select(getClientsNeedRefresh)
            .subscribe({
                next: needsRefresh => {
                    if (needsRefresh) {
                        this.refreshClients();
                    }
                }
            })
    }

    refreshClients(): void {
        this.clientStore.dispatch(loadClients());
    }

    ngOnDestroy(): void {
        this.clientTypesSubscription.unsubscribe();
        this.clientsNeedsRefreshSubscription.unsubscribe();
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
                this.clientStore.dispatch(removeClient({clientId: Number(client.id)}))
                this.confirmationService.close();
                this.refreshClients();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }

    getLabelFromType(type: string): string {
        let maybeLabel = this.clientTypes.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }
}
