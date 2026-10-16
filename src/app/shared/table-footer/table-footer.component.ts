import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {ButtonModule} from "primeng/button";

// Footer under a list table: "Showing 1–10 of N" with Previous / Next (DESIGN_GUIDELINES.md, "List page").
// The parent owns the page index and slices its rows with pageSize.
@Component({
    selector: 'app-table-footer',
    templateUrl: 'table-footer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule]
})
export class TableFooterComponent {
    @Input()
    total: number = 0;
    @Input()
    page: number = 0;
    @Input()
    pageSize: number = 10;
    @Output()
    pageChange: EventEmitter<number> = new EventEmitter<number>();

    get pageCount(): number {
        return Math.max(Math.ceil(this.total / this.pageSize), 1);
    }

    get rangeLabel(): string {
        if (this.total === 0) {
            return 'Showing 0 of 0';
        }
        let start = this.page * this.pageSize;
        return `Showing ${start + 1}–${Math.min(start + this.pageSize, this.total)} of ${this.total}`;
    }

    onPrevious(): void {
        this.pageChange.emit(Math.max(this.page - 1, 0));
    }

    onNext(): void {
        this.pageChange.emit(Math.min(this.page + 1, this.pageCount - 1));
    }
}
