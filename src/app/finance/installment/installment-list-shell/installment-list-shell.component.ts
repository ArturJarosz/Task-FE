import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {InstallmentRestService} from "../rest/installment-rest.service";
import {InstallmentStore} from "../state/installment.state";
import {Installment} from "../../../generated/models/installment";
import {ActivatedRoute} from "@angular/router";
import {InstallmentProjectData} from "../../../generated/models/installment-project-data";

@Component({
    selector: 'installment-list-shell',
    templateUrl: './installment-list-shell.component.html',
    styleUrl: './installment-list-shell.component.less'
})
export class InstallmentListShellComponent implements OnInit{
    projectId!: number;

    readonly installmentStore = inject(InstallmentStore);
    $installments: Signal<Installment[]> = this.installmentStore.installments;
    $installmentProjectData: Signal<InstallmentProjectData> = this.installmentStore.installmentProjectData;
    $installmentsNeedRefresh: Signal<boolean> = this.installmentStore.installmentsNeedRefresh;

    constructor(private installmentRestService: InstallmentRestService, private route: ActivatedRoute) {
        effect(() => {
            if (this.$installmentsNeedRefresh()){
                this.installmentStore.loadProjectInstallments({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.params['projectId'];
        this.projectId = Number(maybeProjectId);

        this.installmentStore.setProjectId(this.projectId);
        this.installmentStore.loadProjectInstallments({});
    }

}
