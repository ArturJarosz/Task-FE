import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {DashboardLayout, DashboardWidgetDefinition, DashboardWidgetType, availableWidgets, fittingWidth, freeWidth}
    from "../layout/dashboard-layout";

interface WidgetOption {
    definition: DashboardWidgetDefinition;
    // Width the widget gets in the row; null when it needs more free space than the row has
    width: number | null;
}

// Lists the widgets that are not on the dashboard yet; picking one adds it to the row at once, as a stack of its own
@Component({
    selector: 'add-widget',
    templateUrl: './add-widget.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule]
})
export class AddWidgetComponent {
    @Input()
    layout: DashboardLayout | null = null;
    // The dialog is open while a row is set
    @Input()
    rowIndex: number | null = null;

    @Output()
    add = new EventEmitter<DashboardWidgetType>();
    @Output()
    closed = new EventEmitter<void>();

    get visible(): boolean {
        return this.rowIndex !== null;
    }

    get free(): number {
        const row = this.rowIndex !== null ? this.layout?.rows[this.rowIndex] : undefined;
        return row ? freeWidth(row) : 0;
    }

    get options(): WidgetOption[] {
        if (!this.layout) {
            return [];
        }
        return availableWidgets(this.layout).map(definition => ({
            definition,
            width: fittingWidth(definition.minWidth, definition.defaultWidth, this.free)
        }));
    }
}
