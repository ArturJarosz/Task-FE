import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ArchitectStore} from "../state";
import {Architect} from "../../generated/models/architect";

@Component({
    selector: 'architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less']
})
export class ArchitectListComponent implements OnInit {
    architectStore = inject(ArchitectStore);

    $architects: Signal<Architect[]> = this.architectStore.architects!;
    $architectsNeedRefresh: Signal<boolean> = this.architectStore.architectsNeedRefresh!;

    constructor() {
        effect(() => {
            if (this.$architectsNeedRefresh()) {
                this.architectStore.loadArchitects({});
            }
        });
    }

    ngOnInit(): void {
        this.architectStore.loadArchitects({});
    }
}
