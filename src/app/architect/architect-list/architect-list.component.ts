import {Component, OnDestroy, OnInit} from '@angular/core';
import {Architect} from "../model/architect";
import {Subscription} from "rxjs";
import {ArchitectState, getArchitects} from "../state/architect.state";
import {Store} from "@ngrx/store";
import {loadArchitects} from "../state/architect.action";

@Component({
    selector: 'app-architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less']
})
export class ArchitectListComponent implements OnInit, OnDestroy {
    private architectsSubscription!: Subscription;
    architects!: Architect[];

    constructor(private architectStore: Store<ArchitectState>) {
    }

    ngOnInit(): void {
        this.architectStore.dispatch(loadArchitects());
        this.architectsSubscription = this.architectStore.select(getArchitects)
            .subscribe({
                next: architects => this.architects = architects
            });
    }

    ngOnDestroy(): void {
        this.architectsSubscription.unsubscribe();
    }

}
