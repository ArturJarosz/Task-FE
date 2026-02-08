import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ContractorJobStore} from "../state/contractor-job.state";
import {ActivatedRoute, Router} from "@angular/router";
import {ContractorJob} from "../../../generated/models/contractor-job";
import {ConfirmationService} from "primeng/api";
import {ContractorStore} from "../../../contractor/state";
import {Contractor} from "../../../generated/models/contractor";

@Component({
    selector: 'contractor-job-detail-shell',
    templateUrl: './contractor-job-detail-shell.component.html',
    styleUrl: './contractor-job-detail-shell.component.less'
})
export class ContractorJobDetailShellComponent implements OnInit {
    projectId: number = 0;
    contractorJobId: number = 0;

    readonly contractorJobStore = inject(ContractorJobStore);
    readonly contractorStore = inject(ContractorStore);
    $contractorJob: Signal<ContractorJob> = this.contractorJobStore.contractorJob;
    $contractors: Signal<Contractor[]> = this.contractorStore.contractors;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {
        effect(() => {
            if (this.contractorJobStore.contractorJobNeedsRefresh() && this.contractorJobStore.projectId() && this.contractorJobStore.contractorJobId()) {
                this.contractorJobStore.loadContractorJob({});
            }
        });
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.params['projectId'];
        let maybeContractorJobId = this.route.snapshot.params['contractorJobId'];

        this.projectId = Number(maybeProjectId);
        this.contractorJobId = Number(maybeContractorJobId);

        this.contractorJobStore.setProjectId(this.projectId);
        this.contractorJobStore.setContractorJobId(this.contractorJobId);

        this.contractorJobStore.loadContractorJob({});
        this.contractorStore.loadContractors({});
    }

    updateContractorJob($event: ContractorJob): void {
        this.contractorJobStore.updateContractorJob({contractorJob: $event});
    }

    deleteContractorJob($event: { contractorJobId: number, contractorJobName: string }): void {
        this.confirmationService.confirm({
            message: `Do you want to delete contractor job ${$event.contractorJobName}?`,
            header: `Confirm contractor job delete`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.contractorJobStore.deleteContractorJob({});
                this.router.navigate([`/projects/${this.projectId}/finance`], {queryParams: {tab: 'contractorJobs'}});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }
}
