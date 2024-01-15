import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {Client, ClientType} from "../client";
import {Store} from "@ngrx/store";
import {ClientState, getClient, loadClient} from "../state";

@Component({
    selector: 'app-client-detail',
    templateUrl: './client-detail.component.html',
    styleUrls: ['./client-detail.component.less']
})
export class ClientDetailComponent implements OnInit, OnDestroy {
    noteCardLabel: string = "Note";
    pageTitle = "Client profile";

    // main info labels
    clientIdLabel: string = "ID:"
    clientTypeLabel: string = "Type: ";
    firstNameLabel: string = "First name:";
    lastNameLabel: string = "Last name:";
    companyNameLabel: string = "Company name:"

    // contact labels
    emailLabel: string = "Email:";
    telephoneLabel: string = "Telephone:";

    // address labels
    cityLabel: string = "City:";
    postCodeLabel: string = "Post code:";
    streetLabel: string = "Street";

    clientId!: number;
    clientSubscription!: Subscription;
    client!: Client | null;
    clientName: string | undefined;
    combinedStreetWithNumbers!: string;

    constructor(private route: ActivatedRoute, private clientStore: Store<ClientState>) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.clientId = Number(maybeNumber);
        this.clientStore.dispatch(loadClient({clientId: this.clientId}));
        this.clientSubscription = this.clientStore.select(getClient)
            .subscribe({
                next: client => this.client = client
            });
    }

    ngOnDestroy(): void {
        this.clientSubscription.unsubscribe();
    }

    resolveClientName(): void {
        if (this.client?.clientType === ClientType.PRIVATE) {
            this.clientName = `${this.client.firstName} ${this.client.lastName}`;
        } else {
            this.clientName = `${this.client?.companyName}`;
        }
    }

    resolveCombinedStreet() {
        if (!this.client?.contact || !this.client.contact?.address || !this.client?.contact) {
            this.combinedStreetWithNumbers = "";
        } else {
            this.combinedStreetWithNumbers = `${this.client?.contact?.address?.street} ${this.client?.contact?.address?.houseNumber}/ ${this.client?.contact?.address?.flatNumber}`;
        }
    }

    protected readonly ClientType = ClientType;
}
