import {ChangeDetectionStrategy, Component} from "@angular/core";

// "Not set" for an empty value in a table cell, list or card, in the muted gray-400 kept for placeholders.
// font-normal keeps it light inside bold cells such as the money column.
@Component({
    selector: 'app-not-set',
    templateUrl: 'not-set.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    host: {class: 'font-normal text-gray-400'}
})
export class NotSetComponent {
}
