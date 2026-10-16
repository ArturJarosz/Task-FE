import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {EmptyStateComponent} from "../empty-state/empty-state.component";

// Shown in place of a page's content when its store reports a failed load: a "Try again" button and an optional way back.
@Component({
    selector: 'app-load-error',
    templateUrl: 'load-error.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [EmptyStateComponent, ButtonModule, RouterLink]
})
export class LoadErrorComponent {
    @Input()
    title!: string;
    @Input()
    text: string = 'It may have been deleted, or the connection failed.';
    @Input()
    backLabel: string = '';
    @Input()
    backRoute: any[] | string | null = null;

    @Output()
    retry = new EventEmitter<void>();
}
