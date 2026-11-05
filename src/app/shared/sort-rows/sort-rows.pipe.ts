import {Pipe, PipeTransform} from "@angular/core";
import {fieldValue, SortValue, sortRows, TableSort} from "../utils/sort-utils";

// Sorted copy of the rows a table shows: [value]="rows | sortRows:sort:sortValue". The table is [lazy]="true", so it
// only reports the sort (onLazyLoad, toTableSort()) and never sorts the input itself, which may be frozen store state.
// Pure, so it sorts again only when the rows, the sort or the value function change.
@Pipe({name: 'sortRows', standalone: true})
export class SortRowsPipe implements PipeTransform {
    transform<T>(rows: T[] | null | undefined, sort: TableSort | null,
                 valueOf: (row: T, field: string) => SortValue = fieldValue): T[] {
        return sortRows(rows ?? [], sort, valueOf);
    }
}
