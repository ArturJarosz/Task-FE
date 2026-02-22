import {Component, inject, OnInit, Signal} from '@angular/core';
import {ArchitectStore} from "../state";
import {Architect} from "../../generated/models/architect";
import {ActivatedRoute} from "@angular/router";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ArchitectDetailComponent} from "../architect-detail/architect-detail.component";

@Component({
    selector: 'architect-detail-shell',
    templateUrl: './architect-detail-shell.component.html',
    styleUrl: './architect-detail-shell.component.less',
    standalone: true,
    imports: [ArchitectDetailComponent]
})
export class ArchitectDetailShellComponent implements OnInit {
    readonly architectStore = inject(ArchitectStore);
    readonly configurationStore = inject(ConfigurationStore);

    $architect: Signal<Architect | null> = this.architectStore.architect;
    $architectProjectsSummary: Signal<EntityProjectsSummary> = this.architectStore.architectProjectsSummary;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;

    architectId!: number;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.architectId = Number(maybeNumber);
        this.architectStore.setArchitectId(this.architectId);
        this.architectStore.loadArchitect({});
        this.architectStore.loadArchitectProjectsSummary({});
    }
}
