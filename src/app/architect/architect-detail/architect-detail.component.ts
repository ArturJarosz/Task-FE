import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ArchitectRestService} from ".././rest/architect-rest.service";
import {Subscription} from "rxjs";
import {Architect} from "../model/architect";

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
    architect: Architect | undefined;

    constructor(private route: ActivatedRoute, private architectRestService: ArchitectRestService) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.architectId = Number(maybeNumber);
        console.log(`architect id: ${this.architectId}`);
        this.architectSubscription = this.architectRestService.getArchitect(this.architectId)
            .subscribe({
                next: architect => {
                    this.architect = architect;
                }
            })
        console.log(JSON.stringify(this.architect));
    }

    ngOnDestroy(): void {
        this.architectSubscription.unsubscribe();
    }
}
