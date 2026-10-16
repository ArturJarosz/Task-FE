import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {NgIf} from "@angular/common";

// Read-only field on detail pages: grey label above the value, "Not set" when empty.
@Component({
    selector: 'omcd-field',
    templateUrl: 'field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf]
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
