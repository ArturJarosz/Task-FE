import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {InstallmentStore} from "../state/installment.state";
import {ActivatedRoute} from "@angular/router";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";
import {Stage} from "../../../generated/models/stage";
import {StageStore} from "../../../stage/state";
import {InstallmentListComponent} from "../installment-list/installment-list.component";
import {AddInstallmentComponent} from "../add-installment/add-installment.component";
import {ButtonModule} from "primeng/button";

@Component({
    selector: 'installment-list-shell',
    templateUrl: './installment-list-shell.component.html',
    styleUrl: './installment-list-shell.component.less',
    standalone: true,
    imports: [InstallmentListComponent, AddInstallmentComponent, ButtonModule]
})
export class InstallmentListShellComponent implements OnInit {
    projectId!: number;

    readonly installmentStore = inject(InstallmentStore);
    readonly stageStore = inject(StageStore);

    $installmentProjectData: Signal<InstallmentProjectData> = this.installmentStore.installmentProjectData;
    $installmentsNeedRefresh: Signal<boolean> = this.installmentStore.installmentsNeedRefresh;
    $stagesNeedRefresh: Signal<boolean> = this.stageStore.stagesNeedRefresh;
    $stages: Signal<Stage[]> = this.stageStore.stages;

    showAddCostComponent: boolean = false;

    constructor(private route: ActivatedRoute) {
        effect(() => {
            this.installmentStore.loadProjectInstallments({});
            if (this.$stagesNeedRefresh()) {
                this.stageStore.loadStages({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.params['projectId'];
        this.projectId = Number(maybeProjectId);

        this.installmentStore.setProjectId(this.projectId);
        this.installmentStore.loadProjectInstallments({});
        this.stageStore.setProjectId(this.projectId);
        this.stageStore.loadStages({});
    }

    onClickAdd() {
        this.showAddCostComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddCostComponent = false;
    }

}
