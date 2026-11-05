import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, Signal} from '@angular/core';
import {ArchitectStore} from "../state";
import {SortValue, sortRows, TableSort} from "../../shared/utils/sort-utils";
import {Architect} from "../../generated/models/architect";
import {ArchitectListComponent, ArchitectRow} from "../architect-list/architect-list.component";
import {LoadErrorComponent, KpiCardComponent, PageCrumb, PageHeaderComponent, TableFooterComponent} from "../../shared";
import {CurrencyPipe} from "@angular/common";

const PAGE_SIZE = 10;

@Component({
    selector: 'architect-list-shell',
    templateUrl: './architect-list-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CurrencyPipe, ArchitectListComponent, LoadErrorComponent, PageHeaderComponent, KpiCardComponent, TableFooterComponent]
})
export class ArchitectListShellComponent implements OnInit {
    readonly architectStore = inject(ArchitectStore);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Architects'}];
    readonly pageSize = PAGE_SIZE;

    $architects: Signal<Architect[]> = this.architectStore.architects!;
    $architectsNeedRefresh: Signal<boolean> = this.architectStore.architectsNeedRefresh!;
    $architectsLoadFailed: Signal<boolean> = this.architectStore.architectsLoadFailed;

    readonly $page = signal<number>(0);

    // Project counts and value come with each architect; the backend decides which project statuses are active
    readonly $rows = computed<ArchitectRow[]>(() => (this.$architects() ?? []).map(architect => ({
        architect: architect,
        projects: architect.numberOfProjects ?? 0,
        activeProjects: architect.numberOfActiveProjects ?? 0,
        value: architect.projectsValue ?? 0,
    })));
    readonly $pageCount = computed(() => Math.max(Math.ceil(this.$rows().length / PAGE_SIZE), 1));
    // The table's column sort, applied to every row before paging
    readonly $sort = signal<TableSort | null>(null);
    readonly $sortedRows = computed(() => sortRows(this.$rows(), this.$sort(), architectSortValue));
    readonly $pagedRows = computed(() => this.$sortedRows().slice(this.$page() * PAGE_SIZE, (this.$page() + 1) * PAGE_SIZE));
    readonly $kpis = computed(() => {
        let rows = this.$rows();
        return {
            architects: rows.length,
            withActiveProjects: rows.filter(row => row.activeProjects > 0).length,
            activeProjects: rows.reduce((sum, row) => sum + row.activeProjects, 0),
            value: rows.reduce((sum, row) => sum + (row.value ?? 0), 0),
        };
    });

    constructor() {
        effect(() => {
            if (this.$architectsNeedRefresh()) {
                this.architectStore.loadArchitects({});
            }
        });
        effect(() => {
            if (this.$page() >= this.$pageCount()) {
                this.$page.set(this.$pageCount() - 1);
            }
        }, {allowSignalWrites: true});
    }

    ngOnInit(): void {
        this.architectStore.setArchitectsNeedRefresh();
        this.architectStore.loadArchitects({});
    }

    onRetry(): void {
        this.architectStore.loadArchitects({});
    }

    onSortChange(sort: TableSort | null) {
        this.$sort.set(sort);
        this.$page.set(0);
    }
}

function architectSortValue(row: ArchitectRow, field: string): SortValue {
    switch (field) {
        case 'name':
            return `${row.architect.firstName ?? ''} ${row.architect.lastName ?? ''}`.trim();
        case 'projects':
            return row.projects;
        case 'activeProjects':
            return row.activeProjects;
        case 'value':
            return row.value;
        default:
            return null;
    }
}
