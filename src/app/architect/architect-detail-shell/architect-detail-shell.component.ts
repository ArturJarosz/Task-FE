import {ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal} from '@angular/core';
import {ArchitectStore} from "../state";
import {Architect} from "../../generated/models/architect";
import {ActivatedRoute} from "@angular/router";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ArchitectDetailComponent} from "../architect-detail/architect-detail.component";
import {NgIf} from "@angular/common";
import {SkeletonModule} from "primeng/skeleton";
import {LoadErrorComponent} from "../../shared";

@Component({
    selector: 'architect-detail-shell',
    templateUrl: './architect-detail-shell.component.html',
    styleUrl: './architect-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, ArchitectDetailComponent, NgIf, SkeletonModule]
})
export class ArchitectDetailShellComponent implements OnInit {
    readonly architectStore = inject(ArchitectStore);
    readonly configurationStore = inject(ConfigurationStore);

    $architectProjectsSummary: Signal<EntityProjectsSummary> = this.architectStore.architectProjectsSummary;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;
    $architectLoadFailed: Signal<boolean> = this.architectStore.architectLoadFailed;
    // The store keeps the previously opened architect until the new one loads, so only show a matching one
    $architect: Signal<Architect | null> = computed(() => {
        let architect = this.architectStore.architect();
        return architect && architect.id === this.architectStore.architectId() ? architect : null;
    });

    architectId!: number;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.architectId = Number(maybeNumber);
        this.architectStore.setArchitectId(this.architectId);
        this.architectStore.loadArchitect({});
        this.architectStore.loadArchitectProjectsSummary({});
        this.configurationStore.loadConfiguration({});
    }

    onRetry(): void {
        this.architectStore.loadArchitect({});
    }
}
