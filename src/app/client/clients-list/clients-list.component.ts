import {Component, OnDestroy, OnInit} from '@angular/core';
import {Client, ClientType} from "../client";
import {ClientService} from "../service/client.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'clients-list',
    templateUrl: './clients-list.component.html',
    styleUrls: ['./clients-list.component.less']
})
export class ClientsListComponent implements OnInit, OnDestroy {
    private clientSubscription!: Subscription;
    protected readonly ClientType = ClientType;

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
}
