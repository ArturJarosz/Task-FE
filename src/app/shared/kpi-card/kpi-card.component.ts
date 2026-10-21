import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {SkeletonModule} from "primeng/skeleton";

// KPI card: a grey icon tile, then the label above the value (projected content). Shows a skeleton while loading
// and "Couldn't load" when the load failed.
@Component({
    selector: 'app-kpi-card',
    templateUrl: 'kpi-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [SkeletonModule],
    host: {class: 'app-card app-kpi-card'}
})
export class KpiCardComponent {
    // PrimeIcons classes, e.g. "pi pi-folder"
    @Input()
    icon!: string;
    @Input()
    label!: string;
    @Input()
    loading: boolean = false;
    @Input()
    loadFailed: boolean = false;
}
