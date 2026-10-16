import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, Signal} from '@angular/core';
import {ClientStore} from "../state";
import {ProjectStore} from "../../project/state";
import {Client} from "../../generated/models/client";
import {ClientType} from "../../generated/models/client-type";
import {Project} from "../../generated/models/project";
import {ProjectStatus} from "../../generated/models/project-status";
import {ClientDto} from "../model/client";
import {ConfirmationService} from "primeng/api";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ClientListComponent, ClientRow} from "../client-list/client-list.component";
import {AddClientComponent} from "../add-client";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ButtonModule} from "primeng/button";
import {NgFor} from "@angular/common";
import {PageCrumb, PageHeaderComponent, TableFooterComponent} from "../../shared";

const PAGE_SIZE = 10;
const ACTIVE_STATUSES: ProjectStatus[] = [ProjectStatus.TO_DO, ProjectStatus.IN_PROGRESS];

export interface ClientSegment {
    key: string;
    label: string;
    type: ClientType | null;
}

const CLIENT_SEGMENTS: ClientSegment[] = [
    {key: 'all', label: 'All', type: null},
    {key: 'private', label: 'Private', type: ClientType.PRIVATE},
    {key: 'company', label: 'Company', type: ClientType.CORPORATE},
];

function inSegment(client: Client, segment: ClientSegment): boolean {
    return !segment.type || client.clientType === segment.type;
}

@Component({
    selector: 'client-list-shell',
    templateUrl: './client-list-shell.component.html',
    styleUrl: './client-list-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ClientListComponent, AddClientComponent, ConfirmDialogModule, ButtonModule, NgFor, PageHeaderComponent, TableFooterComponent]
})
export class ClientListShellComponent implements OnInit {
    readonly clientStore = inject(ClientStore);
    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Clients'}];
    readonly segments = CLIENT_SEGMENTS;
    readonly pageSize = PAGE_SIZE;

    $clients: Signal<Client[] | null> = this.clientStore.clients!;
    $clientsNeedRefresh: Signal<boolean> = this.clientStore.clientsNeedRefresh!;
    $clientTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.clientTypes;
    $projects: Signal<Project[] | null> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;

    readonly $segmentKey = signal<string>('all');
    readonly $page = signal<number>(0);
    showAddClient: boolean = false;

    // Project counts come from the projects list already kept in ProjectStore
    readonly $rows = computed<ClientRow[]>(() => {
        let projects = this.$projects() ?? [];
        return (this.$clients() ?? []).map(client => {
            let own = projects.filter(project => project.client?.id === client.id);
            return {
                client: client,
                projects: own.length,
                activeProjects: own.filter(project => !!project.status && ACTIVE_STATUSES.includes(project.status)).length,
            };
        });
    });
    readonly $segment = computed(() => this.segments.find(segment => segment.key === this.$segmentKey()) ?? this.segments[0]);
    readonly $filteredRows = computed(() => this.$rows().filter(row => inSegment(row.client, this.$segment())));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$filteredRows().length / PAGE_SIZE), 1));
    readonly $pagedRows = computed(() => this.$filteredRows().slice(this.$page() * PAGE_SIZE, (this.$page() + 1) * PAGE_SIZE));
    readonly $segmentCounts = computed(() => {
        let clients = this.$clients() ?? [];
        return Object.fromEntries(this.segments.map(segment =>
            [segment.key, clients.filter(client => inSegment(client, segment)).length]));
    });
    readonly $kpis = computed(() => {
        let rows = this.$rows();
        return {
            clients: rows.length,
            withActiveProjects: rows.filter(row => row.activeProjects > 0).length,
        };
    });
    readonly $emptyTitle = computed(() =>
        this.$segment().key === 'all' ? 'No clients yet' : `No ${this.$segment().label.toLowerCase()} clients`);
    readonly $emptyText = computed(() => this.$segment().key === 'all'
        ? 'Add a client to start a project for them.'
        : 'Pick another type to see the rest of your clients.');

    constructor(private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$clientsNeedRefresh()) {
                this.clientStore.loadClients({});
            }
        });
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        }, {allowSignalWrites: true});
    }

    ngOnInit(): void {
        this.clientStore.loadClients({});
        this.projectStore.loadProjects({});
        this.configurationStore.loadConfiguration({});
    }

    onSelectSegment(key: string) {
        this.$segmentKey.set(key);
        this.$page.set(0);
    }

    onAddClient() {
        this.showAddClient = true;
    }

    onAddClientClosed() {
        this.showAddClient = false;
    }

    onDeleteClient($event: ClientDto) {
        this.clientStore.setClientId($event.id);
        this.confirmationService.confirm({
            header: 'Delete client',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.clientStore.deleteClient({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
