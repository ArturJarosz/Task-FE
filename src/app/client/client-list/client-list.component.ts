import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {ConfirmationService} from "primeng/api";
import {Store} from "@ngrx/store";
import {ClientStore} from "../state";
import {ConfigurationState, getClientTypeConfiguration} from "../../shared/configuration/state";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType, ConfigurationEntry} from "../../generated/models";
import {ClientDto} from "../model/client";

@Component({
    selector: 'client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less',]
})
export class ClientListComponent implements OnInit, OnDestroy {
    clientStore = inject(ClientStore);
    private clientTypesSubscription$!: Subscription;
    showComponent: boolean = false;
    @Input()
    clients!: Client[];
    clientTypes!: ConfigurationEntry[];
    @Output()
    removeClientEvent: EventEmitter<ClientDto> = new EventEmitter<ClientDto>();

    protected readonly ClientType = ClientType;

    constructor(private confirmationService: ConfirmationService,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        this.clientTypesSubscription$ = this.configurationStore.select(getClientTypeConfiguration)
            .subscribe({
                next: (clientTypes: ConfigurationEntry[]) => this.clientTypes = clientTypes
            })
    }

    ngOnDestroy(): void {
        this.clientTypesSubscription$.unsubscribe();
    }

    onClick() {
        this.showComponent = !this.showComponent;
    }

    deleteClientClick(event: MouseEvent, client: Client) {
        // stop propagating row event
        event.stopPropagation();
        let name = client.clientType === ClientType.PRIVATE ? `${client.firstName} ${client.lastName}` : `${client.companyName}`;
        this.removeClientEvent.emit({name: name, id: client.id!});
    }

    onNotify(event: boolean) {
        this.showComponent = !this.showComponent;
    }

    getLabelFromType(type: string): string {
        return resolveLabel(type, this.clientTypes);
    }

}
