import {TableLazyLoadEvent} from "primeng/table";

// Sort of a list page table: the column's field and 1 (ascending) or -1 (descending). The table is [lazy]="true", so it
// only reports the sort; the shell sorts all filtered rows before paging them (DESIGN_GUIDELINES.md, "List page")
export interface TableSort {
    field: string;
    order: 1 | -1;
}

export type SortValue = string | number | null | undefined;

// The sort a lazy table reports, or null when it has none
export function toTableSort(event: TableLazyLoadEvent): TableSort | null {
    let field = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
    return field ? {field, order: event.sortOrder === -1 ? -1 : 1} : null;
}

// A sorted copy: text the Polish way, numbers by value, missing values always last. Without a sort the order stays.
export function sortRows<T>(rows: T[], sort: TableSort | null, valueOf: (row: T, field: string) => SortValue): T[] {
    if (!sort) {
        return rows;
    }
    let collator = new Intl.Collator('pl', {sensitivity: 'base', numeric: true});
    return [...rows].sort((a, b) => {
        let first = valueOf(a, sort.field);
        let second = valueOf(b, sort.field);
        let firstMissing = first == null || first === '';
        let secondMissing = second == null || second === '';
        if (firstMissing || secondMissing) {
            return Number(firstMissing) - Number(secondMissing);
        }
        let order = typeof first === 'number' && typeof second === 'number'
            ? first - second
            : collator.compare(String(first), String(second));
        return order * sort.order;
    });
}

// Value of a column for sorting when the table shows the row's own field: booleans (invoice, paid) sort no before yes
export function fieldValue(row: unknown, field: string): SortValue {
    let value = (row as Record<string, unknown>)?.[field];
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }
    return typeof value === 'number' || typeof value === 'string' ? value : null;
}
