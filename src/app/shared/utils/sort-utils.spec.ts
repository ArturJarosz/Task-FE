import {sortRows, toTableSort} from './sort-utils';

describe('sortRows', () => {
    interface Row {
        name?: string;
        value?: number;
    }
    const rows: Row[] = [{name: 'Żurawia', value: 3}, {name: 'apartament', value: 10}, {value: 1}, {name: 'Łódź', value: 2}];
    const valueOf = (row: Row, field: string) => field === 'name' ? row.name : row.value;

    it('keeps the order without a sort', () => {
        expect(sortRows(rows, null, valueOf)).toBe(rows);
    });

    it('sorts text the Polish way, missing values last', () => {
        expect(sortRows(rows, {field: 'name', order: 1}, valueOf).map(row => row.name))
            .toEqual(['apartament', 'Łódź', 'Żurawia', undefined]);
        expect(sortRows(rows, {field: 'name', order: -1}, valueOf).map(row => row.name))
            .toEqual(['Żurawia', 'Łódź', 'apartament', undefined]);
    });

    it('sorts numbers by value', () => {
        expect(sortRows(rows, {field: 'value', order: -1}, valueOf).map(row => row.value)).toEqual([10, 3, 2, 1]);
    });
});

describe('toTableSort', () => {
    it('reads the field and order a lazy table reports', () => {
        expect(toTableSort({sortField: 'name', sortOrder: -1})).toEqual({field: 'name', order: -1});
        expect(toTableSort({sortField: 'value', sortOrder: 1})).toEqual({field: 'value', order: 1});
        expect(toTableSort({})).toBeNull();
    });
});
