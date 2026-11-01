import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {Router, RouterLink} from "@angular/router";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {MenuItem} from "primeng/api";
import {EmptyStateComponent} from "../empty-state/empty-state.component";
import {NotSetComponent} from "../not-set/not-set.component";
import {capitalize} from "../utils/label-utils";

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
    imports: [TableModule, ButtonModule, MenuModule, TooltipModule, RouterLink, EmptyStateComponent, NotSetComponent]
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

    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    get entityTitle(): string {
        return capitalize(this.entityLabel);
    }

    getInitials(name: string): string {
        let initials = name.trim().split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
        return initials || '?';
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
