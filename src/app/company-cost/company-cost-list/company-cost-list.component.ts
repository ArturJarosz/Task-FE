import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CurrencyPipe, DatePipe} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {Menu, MenuModule} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {CompanyCost} from "../../generated/models/company-cost";
import {TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {ThreeStepSortDirective} from "../../shared/sort-rows/three-step-sort.directive";
import {EmptyStateComponent, NotSetComponent} from "../../shared";

export interface CompanyCostRow {
    companyCost: CompanyCost;
    categoryLabel: string;
    repeatsLabel: string;
    periodLabel: string;
    ended: boolean;
    // "from 03.2026" when the current amount started this year
    amountSince: string | null;
    // Paid this year, or paid in the period the list is filtered by
    paid: number;
}

@Component({
    selector: 'company-cost-list',
    templateUrl: './company-cost-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ThreeStepSortDirective, TableModule, ButtonModule, MenuModule, TooltipModule, TagModule, RouterLink,
        CurrencyPipe, DatePipe, EmptyStateComponent, NotSetComponent]
})
export class CompanyCostListComponent {
    @Input()
    rows: CompanyCostRow[] = [];
    @Input()
    emptyTitle = 'No company costs yet';
    @Input()
    emptyText = '';
    // Header of the paid column: "Paid this year" or "Paid in period"
    @Input()
    paidLabel = 'Paid this year';
    @Output()
    sortChange = new EventEmitter<TableSort | null>();
    @Output()
    payNextCharge = new EventEmitter<CompanyCost>();
    @Output()
    deleteCompanyCost = new EventEmitter<CompanyCost>();

    rowMenuItems: MenuItem[] = [];

    constructor(private router: Router) {
    }

    // The table is lazy: it only reports the sort, and the shell sorts every row before paging
    onSort(event: TableLazyLoadEvent): void {
        this.sortChange.emit(toTableSort(event));
    }

    openRowMenu($event: MouseEvent, companyCost: CompanyCost, menu: Menu): void {
        $event.stopPropagation();
        this.rowMenuItems = [
            {
                label: 'Open', icon: 'pi pi-arrow-right',
                command: () => this.router.navigate(['/company-costs', companyCost.id])
            },
            ...(companyCost.nextCharge ? [{
                label: 'Mark next charge as paid', icon: 'pi pi-check',
                command: () => this.payNextCharge.emit(companyCost)
            }] : []),
            {label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteCompanyCost.emit(companyCost)},
        ];
        menu.toggle($event);
    }
}
