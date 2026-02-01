import {Component, effect, inject, Input, Signal} from '@angular/core';
import {SupervisionStore} from "../state/supervision.state";
import {ProjectStore} from "../../../project/state";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";

@Component({
    selector: 'supervision-shell',
    templateUrl: './supervision-shell.component.html',
    styleUrl: './supervision-shell.component.less'
})
export class SupervisionShellComponent {
    @Input()
    projectId: number = 0;

    readonly supervisionStore = inject(SupervisionStore);
    readonly projectStore = inject(ProjectStore);
    $supervisionVisits: Signal<SupervisionVisit[]> = this.supervisionStore.supervisionVisits;

    showAddSupervisionDialog: boolean = false;
    showAddSupervisionVisitDialog: boolean = false;

    constructor() {
        effect(() => {
            if (this.supervisionStore.supervisionNeedsRefresh() && this.supervisionStore.projectId()) {
                this.supervisionStore.loadSupervision({});
            }
        });
        effect(() => {
            if (this.supervisionStore.supervisionVisitsNeedRefresh() && this.supervisionStore.supervisionId()) {
                this.supervisionStore.loadSupervisionVisits({});
            }
        });
    }

    ngOnInit(): void {
        this.supervisionStore.setProjectId(this.projectId);
        this.supervisionStore.loadSupervision({});
    }

    onClickAdd($event: boolean) {
        this.showAddSupervisionDialog = true;
    }

    onNotifyAddSupervision(event: boolean) {
        this.showAddSupervisionDialog = false;
    }

    onClickAddVisit() {
        this.showAddSupervisionVisitDialog = true;
    }

    onNotifyAddSupervisionVisit(event: boolean) {
        this.showAddSupervisionVisitDialog = false;
    }
}
