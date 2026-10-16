import {Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {ContractorJobStore} from "../state/contractor-job.state";
import {ActivatedRoute, Router} from "@angular/router";
import {ContractorJob} from "../../../generated/models/contractor-job";
import {ConfirmationService} from "primeng/api";
import {ContractorStore} from "../../../contractor/state";
import {Contractor} from "../../../generated/models/contractor";
import {ProjectStore} from "../../../project/state";
import {FinancialItem, FinancialItemDetailComponent, FinancialItemLabels} from "../../financial-item-detail/financial-item-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";

const LABELS: FinancialItemLabels = {item: 'contractor job', partner: 'contractor', partnerRoute: 'contractors', icon: 'pi pi-wrench'};

@Component({
    selector: 'contractor-job-detail-shell',
    templateUrl: './contractor-job-detail-shell.component.html',
    styleUrl: './contractor-job-detail-shell.component.less',
    standalone: true,
    imports: [FinancialItemDetailComponent, ConfirmDialogModule]
})
export class ContractorJobDetailShellComponent implements OnInit {
    projectId: number = 0;
    contractorJobId: number = 0;

    readonly contractorJobStore = inject(ContractorJobStore);
    readonly contractorStore = inject(ContractorStore);
    readonly projectStore = inject(ProjectStore);
    readonly labels = LABELS;
    // While the store still holds a job from another page, show skeletons instead of the wrong one
    $contractorJob: Signal<ContractorJob | null> = computed(() => this.contractorJobStore.contractorJob()?.id === this.contractorJobId ? this.contractorJobStore.contractorJob() : null);
    $item: Signal<FinancialItem | null> = computed(() => {
        const contractorJob = this.$contractorJob();
        return contractorJob ? {...contractorJob, partnerId: contractorJob.contractorId} : null;
    });
    $contractorJobLoadFailed: Signal<boolean> = this.contractorJobStore.contractorJobLoadFailed;
    $contractors: Signal<Contractor[]> = this.contractorStore.contractors;
    // Breadcrumb only
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');

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
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
    }

    updateContractorJob({partnerId, ...item}: FinancialItem): void {
        this.contractorJobStore.updateContractorJob({contractorJob: {...item, contractorId: partnerId}});
    }

    deleteContractorJob($event: { id: number, name: string }): void {
        this.confirmationService.confirm({
            header: 'Delete contractor job',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.contractorJobStore.deleteContractorJob({});
                this.router.navigate([`/projects/${this.projectId}/finance`], {queryParams: {tab: 'contractorJobs'}});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        });
    }

    onReload(): void {
        this.contractorJobStore.loadContractorJob({});
    }
}
