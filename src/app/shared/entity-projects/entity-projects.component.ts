import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../utils/label-utils";
import {statusSeverity} from "../status-severity";
import {EmptyStateComponent} from "../empty-state/empty-state.component";
import {NotSetComponent} from "../not-set/not-set.component";

// "Projects" section card on person detail pages (architect, client): the projects from an EntityProjectsSummary.
@Component({
    selector: 'app-entity-projects',
    templateUrl: 'entity-projects.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, TagModule, RouterLink, CurrencyPipe, DatePipe, EmptyStateComponent, NotSetComponent]
})
export class EntityProjectsComponent {
    @Input()
    summary: EntityProjectsSummary | null = null;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    emptyText: string = 'Projects show up here once they are assigned.';

    protected readonly statusSeverity = statusSeverity;

    getTypeLabel(type: string): string {
        return resolveLabel(type, this.projectTypes);
    }

    getStatusLabel(status: string): string {
        return resolveLabel(status, this.projectStatuses);
    }
}
