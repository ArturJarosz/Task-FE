import {Component, OnDestroy, OnInit} from '@angular/core';
import {ClientRestService} from ".././rest/client-rest.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {Client, ClientType} from "../client";

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
    client: Client | undefined;
    clientName: string | undefined;
    combinedStreetWithNumbers!: string;

    constructor(private clientService: ClientRestService, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.clientId = Number(maybeNumber);
        this.clientSubscription = this.clientService.getClient(this.clientId).subscribe({
            next: client => {
                this.client = client;
                this.resolveClientName();
                this.resolveCombinedStreet();
            }
        })
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
