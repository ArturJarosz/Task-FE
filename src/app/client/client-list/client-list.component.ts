import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {initials} from "../../shared/utils/label-utils";
import {TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {Client, ClientType, ConfigurationEntry} from "../../generated/models";
import {clientDisplayName, ClientDto, clientTypeLabel} from "../model/client";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {TooltipModule} from "primeng/tooltip";
import {Router, RouterLink} from "@angular/router";
import {CurrencyPipe} from "@angular/common";
import {ThreeStepSortDirective} from "../../shared/sort-rows/three-step-sort.directive";

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
    imports: [ThreeStepSortDirective, TableModule, ButtonModule, MenuModule, TooltipModule, RouterLink, CurrencyPipe, EmptyStateComponent, NotSetComponent]
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

    @Output()
    sortChange: EventEmitter<TableSort | null> = new EventEmitter<TableSort | null>();

    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    getName(client: Client): string {
        return clientDisplayName(client);
    }

    getTypeLabel(type: string): string {
        return clientTypeLabel(type);
    }

    // The table is lazy: it only reports the sort, and the shell sorts every row before paging
    onSort(event: TableLazyLoadEvent): void {
        this.sortChange.emit(toTableSort(event));
    }

    getInitials(client: Client): string {
        return initials(clientDisplayName(client));
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
