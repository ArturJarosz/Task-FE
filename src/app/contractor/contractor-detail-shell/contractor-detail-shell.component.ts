import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {ContractorStore} from "../state";
import {ProjectStore} from "../../project/state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Contractor} from "../../generated/models/contractor";
import {ContractorContractorJobsData} from "../../generated/models/contractor-contractor-jobs-data";
import {ContractorCategory} from "../../generated/models/contractor-category";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {SkeletonModule} from "primeng/skeleton";
import {Partner, PartnerDetailComponent, PartnerItemsData, PartnerRef, LoadErrorComponent} from "../../shared";

@Component({
    selector: 'contractor-detail-shell',
    templateUrl: './contractor-detail-shell.component.html',
    styleUrl: './contractor-detail-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LoadErrorComponent, PartnerDetailComponent, ConfirmDialogModule, SkeletonModule]
})
export class ContractorDetailShellComponent implements OnInit {
    contractorId!: number;

    readonly contractorStore = inject(ContractorStore);
    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);

    $contractorNeedsRefresh: Signal<boolean> = this.contractorStore.contractorNeedsRefresh!;
    $contractorJobsDataNeedRefresh: Signal<boolean> = this.contractorStore.contractorJobsDataNeedRefresh;
    $contractorTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractorTypes;
    $projects: Signal<Project[]> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;

    $contractorLoadFailed: Signal<boolean> = this.contractorStore.contractorLoadFailed;
    // The store keeps the previously opened contractor until the new one loads, so only show a matching one
    $contractor: Signal<Contractor | null> = computed(() => {
        let contractor = this.contractorStore.contractor();
        return contractor && contractor.id === this.contractorStore.contractorId() ? contractor : null;
    });
    $itemsData: Signal<PartnerItemsData> = computed(() => {
        let data: ContractorContractorJobsData = this.contractorStore.contractorJobsData();
        return {
            items: data.contractorJobs ?? [],
            financialData: data.financialData,
            averageFinancialData: data.averageFinancialData,
        };
    });
    $projectNames: Signal<Map<number, string>> = computed(() =>
        new Map((this.$projects() ?? []).map(project => [project.id!, project.name ?? ''])));

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
        effect(() => {
            if (this.$contractorNeedsRefresh()) {
                this.contractorStore.loadContractor({});
            }
        });
        effect(() => {
            if (this.$contractorJobsDataNeedRefresh()) {
                this.contractorStore.loadContractorJobsData({});
            }
        });
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
    }

    ngOnInit(): void {
        let maybeId = this.route.snapshot.paramMap.get('contractorId');
        this.contractorId = Number(maybeId);
        this.contractorStore.setContractorId(this.contractorId);
        this.contractorStore.loadContractor({});
        this.contractorStore.loadContractorJobsData({});
        this.projectStore.loadProjects({});
        this.configurationStore.loadConfiguration({});
    }

    onUpdate($event: Partner) {
        let contractor: Contractor = {
            name: $event.name,
            category: $event.category as ContractorCategory,
            email: $event.email,
            telephone: $event.telephone,
            note: $event.note,
        };
        this.contractorStore.updateContractor({contractor: contractor});
    }

    onDelete($event: PartnerRef) {
        this.confirmationService.confirm({
            header: 'Delete contractor',
            message: `Delete ${$event.name}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.contractorStore.setContractorId($event.id);
                this.contractorStore.deleteContractor({});
                this.router.navigate(['/contractors']);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    onRetry(): void {
        this.contractorStore.loadContractor({});
    }
}
