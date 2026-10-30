import {ChangeDetectionStrategy, Component, Input} from "@angular/core";

// Read-only field on detail pages: grey label above the value, "Not set" when empty.
@Component({
    selector: 'app-field',
    templateUrl: 'field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: []
})
export class FieldComponent {
    @Input()
    label!: string;
    @Input()
    value: string | number | null | undefined = null;
    @Input()
    emptyText: string = 'Not set';

    get isEmpty(): boolean {
        return this.value === null || this.value === undefined || this.value === '';
    }
}
