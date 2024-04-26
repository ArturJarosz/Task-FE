import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {Store} from "@ngrx/store";
import {ClientState, getClient, loadClient} from "../state";
import {Client, ClientType} from "../../generated/models";

@Component({
    selector: 'client-detail',
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
    clientSubscription$!: Subscription;
    client!: Client | null;
    clientName: string | undefined;
    combinedStreetWithNumbers!: string;

    constructor(private route: ActivatedRoute, private clientStore: Store<ClientState>) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.clientId = Number(maybeNumber);
        this.clientStore.dispatch(loadClient({clientId: this.clientId}));
        this.clientSubscription$ = this.clientStore.select(getClient)
            .subscribe({
                next: client => this.client = client
            });
        this.resolveCombinedStreet();
    }

    ngOnDestroy(): void {
        this.clientSubscription$.unsubscribe();
    }

    resolveCombinedStreet() {
        if (!this.client?.contact || !this.client.contact?.address || !this.client?.contact) {
            this.combinedStreetWithNumbers = "";
        } else {
            this.combinedStreetWithNumbers = `${this.client?.contact?.address?.street} ${this.client?.contact?.address?.houseNumber}`;
            if (this.client?.contact.address.flatNumber) {
                this.combinedStreetWithNumbers = this.combinedStreetWithNumbers + `/${this.client?.contact?.address?.flatNumber}`;
            }
        }
    }

    protected readonly ClientType = ClientType;
}
