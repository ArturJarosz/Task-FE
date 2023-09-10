import {Component, OnDestroy, OnInit} from '@angular/core';
import {Client, ClientType} from "../client";
import {ClientRestService} from "../service/client-rest.service";
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

    errorMessage: string = '';
    clients: Client[] = [];

    constructor(private clientService: ClientRestService) {
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

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }
}
