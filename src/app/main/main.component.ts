import {Component, OnInit} from '@angular/core';
import {WrapperComponent} from "../shared/wrapper/wrapper.component";

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.less'],
    standalone: true,
    imports: [WrapperComponent]
})
export class MainComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): void {
    }

}
