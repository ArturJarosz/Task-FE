import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ArchitectStore} from "../state";
import {Architect} from "../../generated/models/architect";
import {WrapperComponent} from "../../shared/wrapper/wrapper.component";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {AvatarModule} from "primeng/avatar";

@Component({
    selector: 'architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less'],
    standalone: true,
    imports: [WrapperComponent, TableModule, RouterLink, AvatarModule]
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

    getArchitectInitials(architect: Architect): string {
        if (architect.firstName && architect.lastName) {
            return `${architect.firstName.charAt(0)}${architect.lastName.charAt(0)}`.toUpperCase();
        }
        return '?';
    }
}
