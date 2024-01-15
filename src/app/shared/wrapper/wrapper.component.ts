import {Component, Input} from "@angular/core";

@Component({
    selector: 'wrapper',
    templateUrl: 'wrapper.component.html'
})
export class WrapperComponent {
    @Input()
    title!: string;
    @Input()
    secondaryTitle: string | null = null;
}
