import {Component, inject, OnInit, Signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ArchitectStore} from "../state";
import {Architect} from "../../generated/models/architect";

@Component({
    selector: 'architect-detail',
    templateUrl: './architect-detail.component.html',
    styleUrls: ['./architect-detail.component.less']
})
export class ArchitectDetailComponent implements OnInit {
    pageTitle: string = "Architect profile";
    // main info labels
    architectIdLabel: string = "ID:"
    firstNameLabel: string = "First name:";
    lastNameLabel: string = "Last name:";

    architectStore = inject(ArchitectStore);
    $architect: Signal<Architect | null> = this.architectStore.architect!;

    architectId!: number;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeNumber = this.route.snapshot.paramMap.get("id");
        this.architectId = Number(maybeNumber);
        this.architectStore.setArchitectId(this.architectId);
        this.architectStore.loadArchitect({});
    }

}
