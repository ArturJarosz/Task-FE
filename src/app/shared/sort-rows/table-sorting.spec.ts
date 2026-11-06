import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TableLazyLoadEvent, TableModule} from 'primeng/table';
import {provideTestDependencies} from '../../../testing/test-providers';
import {TableSort, toTableSort} from '../utils/sort-utils';
import {SortRowsPipe} from './sort-rows.pipe';
import {ThreeStepSortDirective} from './three-step-sort.directive';

const NOT_SORTED = 0xe915;
const ASCENDING = 0xea30;
const DESCENDING = 0xea33;

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TableModule, SortRowsPipe, ThreeStepSortDirective],
    template: `
        <p-table [value]="rows | sortRows:sort()" [lazy]="true" [lazyLoadOnInit]="false" (onLazyLoad)="onSort($event)">
            <ng-template #header>
                <tr>
                    <th id="name" pSortableColumn="name">Name <p-sortIcon field="name"/></th>
                    <th id="size" pSortableColumn="size">Size <p-sortIcon field="size"/></th>
                </tr>
            </ng-template>
            <ng-template #body let-row>
                <tr><td>{{ row.name }}</td><td>{{ row.size }}</td></tr>
            </ng-template>
        </p-table>`
})
class SortableTableComponent {
    rows = [{name: 'B', size: 1}, {name: 'A', size: 2}, {name: 'C', size: 3}];
    sort = signal<TableSort | null>(null);

    onSort(event: TableLazyLoadEvent): void {
        this.sort.set(toTableSort(event));
    }
}

describe('table sorting', () => {
    let fixture: ComponentFixture<SortableTableComponent>;
    let element: HTMLElement;

    const icon = (column: string) => element.querySelector(`#${column} p-sorticon`)!;
    // The carets come from styles.css and depend on the svg PrimeNG renders for each state
    const caret = (column = 'name') => getComputedStyle(icon(column), '::before').content.codePointAt(1);
    const click = (column = 'name') => {
        element.querySelector<HTMLElement>(`#${column}`)!.click();
        fixture.detectChanges();
    };
    const names = () => Array.from(element.querySelectorAll('tbody tr td:first-child')).map(cell => cell.textContent);

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [SortableTableComponent], providers: provideTestDependencies()});
        fixture = TestBed.createComponent(SortableTableComponent);
        element = fixture.nativeElement;
        fixture.detectChanges();
    });

    it('cycles ascending, descending, then the original order, with the caret of each', () => {
        expect(names()).toEqual(['B', 'A', 'C']);
        expect(caret()).toBe(NOT_SORTED);

        click();
        expect(names()).toEqual(['A', 'B', 'C']);
        expect(caret()).toBe(ASCENDING);

        click();
        expect(names()).toEqual(['C', 'B', 'A']);
        expect(caret()).toBe(DESCENDING);

        click();
        expect(names()).toEqual(['B', 'A', 'C']);
        expect(caret()).toBe(NOT_SORTED);
        expect(fixture.componentInstance.sort()).toBeNull();

        click();
        expect(names()).toEqual(['A', 'B', 'C']);
    });

    it('starts ascending on another column, whatever the sorted column was at', () => {
        click();
        click();
        click('size');
        expect(fixture.componentInstance.sort()).toEqual({field: 'size', order: 1});
        expect(caret('size')).toBe(ASCENDING);
        expect(caret('name')).toBe(NOT_SORTED);
    });

    it("hides PrimeNG's own icon", () => {
        expect(getComputedStyle(icon('name').querySelector('svg')!).display).toBe('none');
    });
});
