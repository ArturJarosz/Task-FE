import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../utils/label-utils";
import {statusSeverity} from "../status-severity";
import {EmptyStateComponent} from "../empty-state/empty-state.component";
import {NotSetComponent} from "../not-set/not-set.component";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {SortRowsPipe} from "../../shared/sort-rows/sort-rows.pipe";
import {ThreeStepSortDirective} from "../sort-rows/three-step-sort.directive";

// "Projects" section card on person detail pages (architect, client): the projects from an EntityProjectsSummary.
@Component({
    selector: 'app-entity-projects',
    templateUrl: 'entity-projects.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ThreeStepSortDirective, SortRowsPipe, TableModule, TagModule, RouterLink, CurrencyPipe, DatePipe, EmptyStateComponent, NotSetComponent]
})
export class EntityProjectsComponent {

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: NonNullable<EntityProjectsSummary['projects']>[number], field: string): SortValue => {
        switch (field) {
            case 'status':
                return this.getStatusLabel(row.status ?? '');
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }
    @Input()
    summary: EntityProjectsSummary | null = null;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    emptyText: string = 'Projects show up here once they are assigned.';

    protected readonly statusSeverity = statusSeverity;

    getTypeLabel(typeId?: number): string {
        return resolveLabel(typeId, this.projectTypes);
    }

    getStatusLabel(status: string): string {
        return resolveLabel(status, this.projectStatuses);
    }
}
