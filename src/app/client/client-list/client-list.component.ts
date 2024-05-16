import {Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType, ConfigurationEntry} from "../../generated/models";
import {ClientDto} from "../model/client";

@Component({
    selector: 'client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less',]
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

}
