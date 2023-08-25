import {Component, OnDestroy, OnInit} from '@angular/core';
import {Client, ClientType} from "../client";
import {ClientService} from "../service/client.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'clients-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less']
})
export class ClientListComponent implements OnInit, OnDestroy {
    private clientSubscription!: Subscription;
    protected readonly ClientType = ClientType;
    showComponent: boolean = false;

    errorMessage: string = 'a';
    clients: Client[] = [];

    constructor(private clientService: ClientService) {
    }

    ngOnInit(): void {
        this.clientSubscription = this.clientService.getClients().subscribe({
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

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }
}
