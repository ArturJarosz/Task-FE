import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {InstallmentSave, InstallmentStore} from "../state/installment.state";
import {ActivatedRoute} from "@angular/router";
import {Installment} from "../../../generated/models/installment";
import {InstallmentDetailComponent} from "../installment-detail/installment-detail.component";
import {ProjectStore} from "../../../project/state";

@Component({
    selector: 'installment-detail-shell',
    templateUrl: './installment-detail-shell.component.html',
    styleUrl: './installment-detail-shell.component.less',
    standalone: true,
    imports: [InstallmentDetailComponent]
})
export class InstallmentDetailShellComponent implements OnInit {
    projectId: number = 0;
    installmentId: number = 0;

    readonly installmentStore = inject(InstallmentStore);
    readonly projectStore = inject(ProjectStore);
    // While the store still holds an installment from another page, show skeletons instead of the wrong one
    $installment: Signal<Installment | null> = computed(() =>
        this.installmentStore.installment()?.id === this.installmentId ? this.installmentStore.installment() : null);
    $installmentLoadFailed: Signal<boolean> = this.installmentStore.installmentLoadFailed;
    // Breadcrumb only
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let maybeInstallmentId = this.route.snapshot.params['installmentId'];
        let maybeProjectId = this.route.snapshot.params['projectId'];
        this.installmentId = Number(maybeInstallmentId);
        this.projectId = Number(maybeProjectId);
        this.installmentStore.setInstallmentId(this.installmentId);
        this.installmentStore.setProjectId(this.projectId);

        this.installmentStore.loadInstallment({});
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
    }

    saveInstallment($event: InstallmentSave) {
        this.installmentStore.saveInstallment($event);
    }

    onReload(): void {
        this.installmentStore.loadInstallment({});
    }
}
