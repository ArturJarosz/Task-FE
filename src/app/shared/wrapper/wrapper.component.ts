import {Component, Input} from "@angular/core";

@Component({
    selector: 'wrapper',
    templateUrl: 'wrapper.component.html'
})
export class WrapperComponent {
    @Input()
    title!: string;
}
