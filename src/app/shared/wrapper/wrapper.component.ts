import {Component, Input} from "@angular/core";
import {NgIf} from "@angular/common";

@Component({
    selector: 'wrapper',
    templateUrl: 'wrapper.component.html',
    standalone: true,
    imports: [NgIf]
})
export class WrapperComponent {
    @Input()
    title!: string;
    @Input()
    secondaryTitle: string | null = null;
}
