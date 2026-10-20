import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {resolveLabel} from "../../shared/utils/label-utils";
import {Client, ClientType, ConfigurationEntry} from "../../generated/models";
import {ClientDto} from "../model/client";
import {EmptyStateComponent} from "../../shared";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {TooltipModule} from "primeng/tooltip";
import {Router, RouterLink} from "@angular/router";
import {CurrencyPipe, NgIf} from "@angular/common";

export interface ClientRow {
    client: Client;
    projects: number;
    activeProjects: number;
    value: number;
}

@Component({
    selector: 'client-list',
    templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, ButtonModule, MenuModule, TooltipModule, RouterLink, NgIf, CurrencyPipe, EmptyStateComponent]
})
export class ClientListComponent {
    @Input()
    rows: ClientRow[] = [];
    @Input()
    clientTypes: ConfigurationEntry[] | null = [];
    @Input()
    emptyTitle: string = 'No clients yet';
    @Input()
    emptyText: string = 'Add a client to start a project for them.';
    @Output()
    removeClientEvent: EventEmitter<ClientDto> = new EventEmitter<ClientDto>();

    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    getName(client: Client): string {
        return client.clientType === ClientType.CORPORATE
            ? client.companyName ?? ''
            : `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
    }

    getTypeLabel(type: string): string {
        return resolveLabel(type, this.clientTypes);
    }

    getInitials(client: Client): string {
        if (client.clientType === ClientType.CORPORATE && client.companyName) {
            return client.companyName.charAt(0).toUpperCase();
        }
        if (client.firstName && client.lastName) {
            return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
        }
        return '?';
    }

    openRowMenu($event: MouseEvent, client: Client, menu: Menu) {
        $event.stopPropagation();
        this.rowMenuItems = [
            {label: 'Open', icon: 'pi pi-arrow-right', command: () => this.router.navigate(['/clients', client.id])},
            {
                label: 'Delete client', icon: 'pi pi-trash',
                command: () => this.removeClientEvent.emit({name: this.getName(client), id: client.id!})
            }
        ];
        menu.toggle($event);
    }
}
