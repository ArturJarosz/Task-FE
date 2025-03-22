import {Component, inject, OnInit, Signal} from '@angular/core';
import {InstallmentStore} from "../state/installment.state";
import {ActivatedRoute} from "@angular/router";
import {Installment} from "../../../generated/models/installment";

@Component({
    selector: 'installment-detail-shell',
    templateUrl: './installment-detail-shell.component.html',
    styleUrl: './installment-detail-shell.component.less'
})
export class InstallmentDetailShellComponent implements OnInit {
    projectId: number = 0;
    installmentId: number = 0;

    readonly installmentStore = inject(InstallmentStore);
    $installment: Signal<Installment> = this.installmentStore.installment!;

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
    }

}
