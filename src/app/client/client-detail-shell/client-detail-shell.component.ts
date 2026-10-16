import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {Client} from "../../generated/models/client";
import {ActivatedRoute, Router} from "@angular/router";
import {ClientStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ClientDto} from "../model/client";
import {ConfirmationService} from "primeng/api";
import {ClientDetailComponent} from "../client-detail/client-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {SkeletonModule} from "primeng/skeleton";
import {NgIf} from "@angular/common";
import {LoadErrorComponent} from "../../shared";

@Component({
    selector: 'client-detail-shell',
    templateUrl: './client-detail-shell.component.html',
    styleUrl: './client-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, ClientDetailComponent, ConfirmDialogModule, SkeletonModule, NgIf]
})
export class ClientDetailShellComponent implements OnInit {
    readonly clientStore = inject(ClientStore);
    readonly configurationStore = inject(ConfigurationStore);

    $clientNeedsRefresh: Signal<boolean> = this.clientStore.clientNeedsRefresh!;
    $clientProjectsSummary: Signal<EntityProjectsSummary | null> = this.clientStore.clientProjectsSummary!;
    $clientTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.clientTypes;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;
    $clientLoadFailed: Signal<boolean> = this.clientStore.clientLoadFailed;
    // The store keeps the previously opened client until the new one loads, so only show a matching one
    $client: Signal<Client | null> = computed(() => {
        let client = this.clientStore.client();
        return client && client.id === this.clientStore.clientId() ? client : null;
    });

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
        effect(() => {
            if (this.$clientNeedsRefresh()) {
                this.clientStore.loadClient({});
                this.clientStore.loadClientProjectsSummary({});
            }
        });
    }

    ngOnInit(): void {
        let maybeClientId = this.route.snapshot.paramMap.get("id");
        let clientId = Number(maybeClientId);
        this.clientStore.setClientId(clientId);
        this.clientStore.loadClient({});
        this.clientStore.loadClientProjectsSummary({});
        this.configurationStore.loadConfiguration({});
    }

    onUpdate($event: Client) {
        this.clientStore.updateClient({client: $event});
    }

    onDelete($event: ClientDto) {
        this.confirmationService.confirm({
            header: 'Delete client',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.clientStore.setClientId($event.id);
                this.clientStore.deleteClient({clientId: $event.id});
                this.router.navigate([`/clients`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    onRetry(): void {
        this.clientStore.loadClient({});
    }
}
