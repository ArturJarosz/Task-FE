import {Component, OnDestroy, OnInit} from '@angular/core';
import {Architect} from "../model/architect";
import {Subscription} from "rxjs";
import {ArchitectRestService} from ".././rest/architect-rest.service";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../../shared";

@Component({
    selector: 'app-architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less']
})
export class ArchitectListComponent implements OnInit, OnDestroy {
    private architectsSubscription!: Subscription;
    architects!: Architect[];

    constructor(private architectRestService: ArchitectRestService, private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.architectsSubscription = this.architectRestService.getArchitects()
            .subscribe({
                next: architects => this.architects = architects,
                error: error => {
                    this.messageService.add({
                        severity: MessageSeverity.ERROR,
                        summary: 'Error loading clients.',
                        detail: `Client list cannot be loaded. Error: ${JSON.stringify(error)}`
                    })
                }
            });
    }

    ngOnDestroy(): void {
        this.architectsSubscription.unsubscribe();
    }

}
