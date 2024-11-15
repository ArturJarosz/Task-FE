import {Component, effect, inject, Input, OnInit, Signal} from '@angular/core';
import {ContractorJobStore} from "../state/contractor-job.state";
import {ContractorStore} from "../../../contractor/state";
import {ContractorJobProjectData} from "../../../generated/models/contractor-job-project-data";
import {Contractor} from "../../../generated/models/contractor";

@Component({
    selector: 'contractor-job-list-shell',
    templateUrl: './contractor-job-list-shell.component.html',
    styleUrl: './contractor-job-list-shell.component.less'
})
export class ContractorJobListShellComponent implements OnInit {
    @Input()
    projectId: number = 0;

    readonly contractorJobStore = inject(ContractorJobStore);
    readonly contractorStore = inject(ContractorStore);

    $contractorJobsNeedRefresh: Signal<boolean> = this.contractorJobStore.contractorJobsNeedRefresh!;
    $contractorsJobsProjectData: Signal<ContractorJobProjectData> = this.contractorJobStore.contractorsJobsProjectData!;
    $contractorsNeedRefresh: Signal<boolean> = this.contractorStore.contractorsNeedRefresh!;
    $contractors: Signal<Contractor[]> = this.contractorStore.contractors;

    showAddContractorJobDialog: boolean = false;

    constructor() {
        effect(() => {
            if (this.$contractorJobsNeedRefresh()) {
                this.contractorJobStore.loadContractorsJobsProjectData({});
            }
            if (this.$contractorsNeedRefresh()) {
                this.contractorStore.loadContractors({});
            }
        });
    }

    ngOnInit(): void {
        this.contractorJobStore.setProjectId(this.projectId);
        this.contractorJobStore.loadContractorsJobsProjectData({});
        this.contractorStore.loadContractors({});
    }

    onClickAdd() {
        this.showAddContractorJobDialog = true;
    }

    onNotify() {
        this.showAddContractorJobDialog = false;
    }
}
