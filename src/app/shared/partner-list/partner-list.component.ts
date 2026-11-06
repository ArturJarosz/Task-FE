import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {Router, RouterLink} from "@angular/router";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {SortValue, TableSort, toTableSort} from "../utils/sort-utils";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";
import {EmptyStateComponent} from "../empty-state/empty-state.component";
import {NotSetComponent} from "../not-set/not-set.component";
import {capitalize, initials} from "../utils/label-utils";
import {ThreeStepSortDirective} from "../sort-rows/three-step-sort.directive";

// A business partner row: contractors and suppliers share the same shape
export interface PartnerRow {
    id: number;
    name: string;
    category: string;
    email?: string;
    telephone?: string;
    count: number;
}

export interface PartnerRef {
    id: number;
    name: string;
}

// Table for the Contractors and Suppliers list pages (DESIGN_GUIDELINES.md, "List page")
@Component({
    selector: 'app-partner-list',
    templateUrl: 'partner-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ThreeStepSortDirective, TableModule, ButtonModule, MenuModule, TooltipModule, RouterLink, EmptyStateComponent, NotSetComponent]
})
export class PartnerListComponent {
    @Input()
    rows: PartnerRow[] = [];
    @Input()
    routeBase: string = '';
    // Singular noun used in the column header, row menu and tooltips, e.g. "contractor"
    @Input()
    entityLabel: string = '';
    @Input()
    countLabel: string = '';
    @Input()
    icon: string = 'pi pi-inbox';
    @Input()
    emptyText: string = '';
    @Output()
    deleteEvent: EventEmitter<PartnerRef> = new EventEmitter<PartnerRef>();

    @Output()
    sortChange: EventEmitter<TableSort | null> = new EventEmitter<TableSort | null>();

    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    get entityTitle(): string {
        return capitalize(this.entityLabel);
    }

    getInitials(name: string): string {
        return initials(name);
    }

    // The table is lazy: it only reports the sort, and the shell sorts every row before paging
    onSort(event: TableLazyLoadEvent): void {
        this.sortChange.emit(toTableSort(event));
    }

    openRowMenu($event: MouseEvent, row: PartnerRow, menu: Menu) {
        $event.stopPropagation();
        this.rowMenuItems = [
            {label: 'Open', icon: 'pi pi-arrow-right', command: () => this.router.navigate([this.routeBase, row.id])},
            {label: `Delete ${this.entityLabel}`, icon: 'pi pi-trash', command: () => this.deleteEvent.emit({id: row.id, name: row.name})}
        ];
        menu.toggle($event);
    }
}

// Sort value of a partner row for the list shells
export function partnerSortValue(row: PartnerRow, field: string): SortValue {
    switch (field) {
        case 'name':
            return row.name;
        case 'contact':
            return row.email ?? row.telephone;
        case 'count':
            return row.count;
        default:
            return null;
    }
}
