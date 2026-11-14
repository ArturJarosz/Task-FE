import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, Signal, untracked} from '@angular/core';
import {ProjectStore, ProjectTimeSummaryStore} from "../state";
import {ArchitectStore} from "../../architect/state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {ActivatedRoute, Router} from "@angular/router";
import {Architect} from "../../generated/models/architect";
import {Project} from "../../generated/models/project";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {ConfirmationService} from "primeng/api";
import {ProjectDetailComponent, ProjectDetailView, ProjectUpdate} from "../project-detail/project-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {InstallmentStore} from "../../finance/installment/state/installment.state";
import {Installment} from "../../generated/models/installment";
import {ProjectTimeSummary} from "../../generated/models/project-time-summary";

@Component({
    selector: 'project-detail-shell',
    templateUrl: './project-detail-shell.component.html',
    styleUrls: ['./project-detail-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ProjectDetailComponent, ConfirmDialogModule]
})
export class ProjectDetailShellComponent implements OnInit {
    projectId: number = 0;
    view: ProjectDetailView = 'overview';

    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly installmentStore = inject(InstallmentStore);
    readonly timeSummaryStore = inject(ProjectTimeSummaryStore);
    // While the store still holds a project from another page, show skeletons instead of the wrong one
    $project: Signal<Project | null> = computed(() => this.projectStore.project()?.id === this.projectId ? this.projectStore.project() : null);
    $projectLoadFailed: Signal<boolean> = this.projectStore.projectLoadFailed;
    $architects: Signal<Architect[]> = this.architectStore.architects;
    $projectNeedsRefresh: Signal<boolean> = this.projectStore.projectNeedsRefresh!;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;
    $contractStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.contractStatuses;
    $stageStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageStatuses;
    $installments: Signal<Installment[]> = computed(() => this.installmentStore.installmentProjectData().installments ?? []);
    $installmentsLoadFailed: Signal<boolean> = this.installmentStore.installmentsLoadFailed;
    $installmentsNeedRefresh: Signal<boolean> = this.installmentStore.installmentsNeedRefresh;
    $hasDeposit: Signal<boolean | null> = this.installmentStore.hasDeposit;
    // The store drops the summary of another project, so it always belongs to this one
    $timeSummary: Signal<ProjectTimeSummary | null> = this.timeSummaryStore.timeSummary;
    $timeSummaryLoading: Signal<boolean> = this.timeSummaryStore.timeSummaryLoading;
    $timeSummaryLoadFailed: Signal<boolean> = this.timeSummaryStore.timeSummaryLoadFailed;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private confirmationService: ConfirmationService) {
        effect(() => {
            if (this.$projectNeedsRefresh()) {
                this.projectStore.loadProject({});
            }
        })
        // Loads the installments when the project is opened, and again after a change such as a deposit added from
        // the contract dialog
        effect(() => {
            if (this.$installmentsNeedRefresh()) {
                this.installmentStore.loadProjectInstallments({});
            }
        })
        // The overview's "Time and rate" card loads when the overview is opened and again after time is logged
        effect(() => {
            if (this.view === 'overview' && this.timeSummaryStore.timeSummaryNeedsRefresh()) {
                untracked(() => this.timeSummaryStore.loadTimeSummary());
            }
        })
    }

    ngOnInit(): void {
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.projectId = Number(maybeProjectId);
        this.view = this.route.snapshot.data['view'] ?? 'overview';
        this.projectStore.setProjectId(this.projectId);
        this.projectStore.loadProject({});
        // The effect above loads them once the project is set
        this.installmentStore.setProjectId(this.projectId);
        this.timeSummaryStore.setProjectId(this.projectId);
        if (this.view === 'overview') {
            // The project's finances and supervision visits change the summary too, so it loads on every visit
            this.timeSummaryStore.setTimeSummaryNeedsRefresh();
        }

        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
    }

    onUpdateProject({project, afterSave}: ProjectUpdate) {
        this.projectStore.updateProject({project, afterSave});
    }

    onRemoveProject($event: void) {
        let projectName = this.projectStore.project()!.name;
        this.confirmationService.confirm({
            header: 'Delete project',
            message: `Delete ${projectName}? This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.projectStore.removeProject({});
                this.router.navigate([`/projects`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    onReload(): void {
        this.projectStore.loadProject({});
    }

    onReloadInstallments(): void {
        this.installmentStore.loadProjectInstallments({});
    }

    onReloadTimeSummary(): void {
        this.timeSummaryStore.loadTimeSummary();
    }
}
