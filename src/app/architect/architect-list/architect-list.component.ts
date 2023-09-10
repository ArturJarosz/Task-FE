import {Component, OnDestroy, OnInit} from '@angular/core';
import {Architect} from "../model/architect";
import {Subscription} from "rxjs";
import {ArchitectRestService} from "../service/architect-rest.service";

@Component({
    selector: 'app-architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less']
})
export class ArchitectListComponent implements OnInit, OnDestroy {
    private architectsSubscription!: Subscription;
    architects!: Architect[];
    errorMessage: string = '';

    constructor(private architectRestService: ArchitectRestService) {
    }

    ngOnInit(): void {
        this.architectsSubscription = this.architectRestService.getArchitects()
            .subscribe({
                next: architects => this.architects = architects,
                error: error => this.errorMessage = error
            });
        console.log("architects - after sub: " + JSON.stringify(this.architects));
    }


    ngOnDestroy(): void {
        this.architectsSubscription.unsubscribe();
    }

}
