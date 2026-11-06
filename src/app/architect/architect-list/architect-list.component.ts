import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {initials} from "../../shared/utils/label-utils";
import {Architect} from "../../generated/models/architect";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {RouterLink} from "@angular/router";
import {CurrencyPipe} from "@angular/common";
import {EmptyStateComponent} from "../../shared";
import {ThreeStepSortDirective} from "../../shared/sort-rows/three-step-sort.directive";

export interface ArchitectRow {
    architect: Architect;
    projects: number;
    activeProjects: number;
    value: number;
}

@Component({
    selector: 'architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ThreeStepSortDirective, TableModule, RouterLink, CurrencyPipe, EmptyStateComponent]
})
export class ArchitectListComponent {
    @Input()
    rows: ArchitectRow[] = [];
    @Output()
    sortChange: EventEmitter<TableSort | null> = new EventEmitter<TableSort | null>();

    // The table is lazy: it only reports the sort, and the shell sorts every row before paging
    onSort(event: TableLazyLoadEvent): void {
        this.sortChange.emit(toTableSort(event));
    }

    getName(architect: Architect): string {
        return `${architect.firstName ?? ''} ${architect.lastName ?? ''}`.trim();
    }

    getInitials(architect: Architect): string {
        return initials(architect.firstName, architect.lastName);
    }
}
