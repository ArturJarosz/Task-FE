import {Directive, inject} from "@angular/core";
import {SortEvent} from "primeng/api";
import {Table} from "primeng/table";

// A column header cycles ascending, descending, then back to the original order. PrimeNG only flips between the first
// two, so a third click on the sorted column clears the sort instead; the table then reports no sort (toTableSort()
// gives null). Import it next to TableModule in every component with a sortable table
@Directive({selector: 'p-table', standalone: true})
export class ThreeStepSortDirective {
    constructor() {
        const table = inject(Table);
        const sort = table.sort.bind(table);
        table.sort = (event: SortEvent) => {
            if (table.sortField === event.field && table.sortOrder === -1) {
                table.clear();
            } else {
                sort(event);
            }
        };
    }
}
