import {ChangeDetectionStrategy, Component, Input} from "@angular/core";

// Empty state inside a card: grey icon circle, title, one line of explanation, optional projected button.
@Component({
    selector: 'omcd-empty-state',
    templateUrl: 'empty-state.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class EmptyStateComponent {
    @Input()
    icon: string = 'pi pi-inbox';
    @Input()
    title!: string;
    @Input()
    text: string = '';
}
