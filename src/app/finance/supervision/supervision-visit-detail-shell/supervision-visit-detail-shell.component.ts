import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {SupervisionStore} from "../state/supervision.state";
import {ActivatedRoute, Router} from "@angular/router";
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {ConfirmationService} from "primeng/api";
import {ProjectStore} from "../../../project/state";
import {SupervisionVisitDetailComponent} from "../supervision-visit-detail/supervision-visit-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
    selector: 'supervision-visit-detail-shell',
    templateUrl: './supervision-visit-detail-shell.component.html',
    styleUrl: './supervision-visit-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [SupervisionVisitDetailComponent, ConfirmDialogModule]
})
export class SupervisionVisitDetailShellComponent implements OnInit {
    projectId: number = 0;
    supervisionId: number = 0;
    visitId: number = 0;

    readonly supervisionStore = inject(SupervisionStore);
    readonly projectStore = inject(ProjectStore);
    // While the store still holds a visit from another page, show skeletons instead of the wrong one
    $supervisionVisit: Signal<SupervisionVisit | null> = computed(() =>
        this.supervisionStore.supervisionVisit()?.id === this.visitId ? this.supervisionStore.supervisionVisit() : null);
    $supervisionVisitLoadFailed: Signal<boolean> = this.supervisionStore.supervisionVisitLoadFailed;
    // Breadcrumb only
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');

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
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
    }

    updateVisit($event: SupervisionVisit): void {
        this.supervisionStore.updateSupervisionVisit({supervisionVisit: $event});
    }

    deleteVisit($event: { visitId: number, visitDate: string }): void {
        this.confirmationService.confirm({
            header: 'Delete visit',
            message: `${$event.visitDate ? `Delete the visit on ${$event.visitDate}?` : 'Delete this visit?'} This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.supervisionStore.deleteSupervisionVisit({});
                this.router.navigate([`/projects/${this.projectId}/finance`], {queryParams: {tab: 'supervision'}});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        });
    }

    onReload(): void {
        this.supervisionStore.loadSupervisionVisit({});
    }
}
