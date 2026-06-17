import {Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType, ConfigurationEntry} from "../../generated/models";
import {ClientDto} from "../model/client";
import {WrapperComponent} from "../../shared";
import {AddClientComponent} from "../add-client";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {AvatarModule} from "primeng/avatar";

@Component({
    selector: 'client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less',],
    standalone: true,
    imports: [WrapperComponent, AddClientComponent, TableModule, ButtonModule, RouterLink, AvatarModule]
})
export class ClientListComponent {
    showComponent: boolean = false;
    @Input()
    clients!: Client[];
    @Input()
    clientTypes!: ConfigurationEntry[];
    @Output()
    removeClientEvent: EventEmitter<ClientDto> = new EventEmitter<ClientDto>();

    protected readonly ClientType = ClientType;

    constructor() {
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

    getClientInitials(client: Client): string {
        if (client.clientType === ClientType.PRIVATE && client.firstName && client.lastName) {
            return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
        }
        if (client.clientType === ClientType.CORPORATE && client.companyName) {
            return client.companyName.charAt(0).toUpperCase();
        }
        return '?';
    }

}
