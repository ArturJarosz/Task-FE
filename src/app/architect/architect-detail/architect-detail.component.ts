import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {Architect} from "../model/architect";
import {Store} from "@ngrx/store";
import {ArchitectState, getArchitect} from "../state/architect.state";
import {loadArchitect} from "../state/architect.action";

@Component({
    selector: 'app-architect-detail',
    templateUrl: './architect-detail.component.html',
    styleUrls: ['./architect-detail.component.less']
})
export class ArchitectDetailComponent implements OnInit, OnDestroy {
    pageTitle: string = "Architect profile";
    // main info labels
    architectIdLabel: string = "ID:"
    firstNameLabel: string = "First name:";
    lastNameLabel: string = "Last name:";

    architectId!: number;
    architectSubscription!: Subscription
    architect!: Architect | null;

    constructor(private route: ActivatedRoute, private architectStore: Store<ArchitectState>) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.architectId = Number(maybeNumber);
        this.architectStore.dispatch(loadArchitect({architectId: this.architectId}));
        this.architectSubscription = this.architectStore.select(getArchitect)
            .subscribe({
                next: architect => this.architect = architect
            });
    }

    ngOnDestroy(): void {
        this.architectSubscription.unsubscribe();
    }
}
