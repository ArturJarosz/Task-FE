import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {SupervisionStore} from "../state/supervision.state";
import {ActivatedRoute, Router} from "@angular/router";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'supervision-visit-detail-shell',
    templateUrl: './supervision-visit-detail-shell.component.html',
    styleUrl: './supervision-visit-detail-shell.component.less'
})
export class SupervisionVisitDetailShellComponent implements OnInit {
    projectId: number = 0;
    supervisionId: number = 0;
    visitId: number = 0;

    readonly supervisionStore = inject(SupervisionStore);
    $supervisionVisit: Signal<SupervisionVisit | null> = this.supervisionStore.supervisionVisit;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {
        effect(() => {
            if (this.supervisionStore.supervisionVisitNeedsRefresh() && this.supervisionStore.supervisionId() && this.supervisionStore.visitId()) {
                this.supervisionStore.loadSupervisionVisit({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.params['projectId'];
        let maybeSupervisionId = this.route.snapshot.params['supervisionId'];
        let maybeVisitId = this.route.snapshot.params['visitId'];

        this.projectId = Number(maybeProjectId);
        this.supervisionId = Number(maybeSupervisionId);
        this.visitId = Number(maybeVisitId);

        this.supervisionStore.setProjectId(this.projectId);
        this.supervisionStore.setSupervisionId(this.supervisionId);
        this.supervisionStore.setVisitId(this.visitId);

        this.supervisionStore.loadSupervisionVisit({});
    }

    updateVisit($event: SupervisionVisit): void {
        this.supervisionStore.updateSupervisionVisit({supervisionVisit: $event});
    }

    deleteVisit($event: {visitId: number, dateOfVisit: string}): void {
        this.confirmationService.confirm({
            message: `Do you want to delete supervision visit from ${$event.dateOfVisit}?`,
            header: `Confirm visit delete`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.supervisionStore.deleteSupervisionVisit({});
                this.router.navigate([`/projects/${this.projectId}/finance`], {queryParams: {tab: 'supervision'}});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
