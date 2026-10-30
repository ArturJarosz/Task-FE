import {ChangeDetectionStrategy, Component, Input} from "@angular/core";

// Yes/no table column: a green check for yes, a muted dash for no. The label names the column for screen readers.
@Component({
    selector: 'app-yes-no-mark',
    templateUrl: 'yes-no-mark.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class YesNoMarkComponent {
    @Input()
    value: boolean | null | undefined = false;
    @Input()
    label!: string;
}
