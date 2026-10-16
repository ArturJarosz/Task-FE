import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StageStore} from "../state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageDto} from "../model/stage";
import {ConfirmationService} from "primeng/api";
import {ArchitectStore} from "../../architect/state/architect.state";
import {Architect} from "../../generated/models/architect";
import {ProjectStore} from "../../project/state";
import {StageDetailComponent} from "../stage-detail/stage-detail.component";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
    selector: 'stage-detail-shell',
    templateUrl: './stage-detail-shell.component.html',
    styleUrls: ['./stage-detail-shell.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [StageDetailComponent, ConfirmDialogModule]
})
export class StageDetailShellComponent implements OnInit {
    projectId!: number;
    stageId!: number;

    readonly configurationStore = inject(ConfigurationStore);
    readonly stageStore = inject(StageStore);
    readonly architectStore = inject(ArchitectStore);
    readonly projectStore = inject(ProjectStore);
    // While the store still holds a stage from another page, show skeletons instead of the wrong stage
    $stage: Signal<Stage | null> = computed(() => this.stageStore.stage()?.id === this.stageId ? this.stageStore.stage() : null);
    $stageNeedsRefresh: Signal<boolean> = this.stageStore.stageNeedsRefresh;
    $stageLoadFailed: Signal<boolean> = this.stageStore.stageLoadFailed;
    $stageTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;
    $stageStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageStatuses;
    $architects: Signal<Architect[]> = this.architectStore.architects;
    // Breadcrumb only; the store may still hold another project until the load below finishes
    $projectName: Signal<string> = computed(() =>
        this.projectStore.project()?.id === this.projectId ? this.projectStore.projectName() : '');

    constructor(private route: ActivatedRoute, private confirmationService: ConfirmationService,
                private router: Router) {
        effect(() => {
            if (this.$stageNeedsRefresh()) {
                this.stageStore.loadStage({});
            }
        })
    }

    ngOnInit(): void {
        this.stageId = Number(this.route.snapshot.paramMap.get('stageId'));
        this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

        this.stageStore.setProjectId(this.projectId);
        this.stageStore.setStageId(this.stageId);
        this.projectStore.setProjectId(this.projectId);

        this.stageStore.loadStage({});
        this.projectStore.loadProject({});
        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
    }

    deleteStage($event: StageDto) {
        this.confirmationService.confirm({
            header: 'Delete stage',
            message: `Delete ${$event.stageName}? Its tasks are deleted too. This can't be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Delete', severity: 'danger'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.stageStore.setProjectId(this.projectId);
                this.stageStore.setStageId($event.stageId);
                this.stageStore.deleteStage({});
                this.router.navigate(['/projects', this.projectId, 'stages']);
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        })
    }

    rejectStage($event: StageDto) {
        this.confirmationService.confirm({
            header: 'Reject stage',
            message: `Reject ${$event.stageName}? You can reopen it later.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {label: 'Reject stage'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.stageStore.setProjectId(this.projectId);
                this.stageStore.setStageId($event.stageId);
                this.stageStore.rejectStage({});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        })
    }

    reopenStage($event: StageDto) {
        this.confirmationService.confirm({
            header: 'Reopen stage',
            message: `Reopen ${$event.stageName}?`,
            icon: 'pi pi-replay',
            acceptButtonProps: {label: 'Reopen stage'},
            rejectButtonProps: {label: 'Cancel', severity: 'secondary', outlined: true},
            accept: () => {
                this.stageStore.setProjectId(this.projectId);
                this.stageStore.setStageId($event.stageId);
                this.stageStore.reopenStage({});
                this.confirmationService.close();
            },
            reject: () => this.confirmationService.close()
        })
    }

    reloadStage() {
        this.stageStore.setProjectId(this.projectId);
        this.stageStore.setStageId(this.stageId);
        this.stageStore.loadStage({});
    }

    updateStage($event: Stage) {
        this.stageStore.updateStage({stage: $event});
    }
}
