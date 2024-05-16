import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {StageState, StageStore} from "../state";
import {Store} from "@ngrx/store";
import {ConfigurationStore} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageDto} from "../model/stage";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'stage-detail-shell',
    templateUrl: './stage-detail-shell.component.html',
    styleUrls: ['./stage-detail-shell.component.less']
})
export class StageDetailShellComponent implements OnInit {
    projectId!: number;
    stageId!: number;

    readonly configurationStore = inject(ConfigurationStore);
    readonly stageStore = inject(StageStore);
    $stage: Signal<Stage | null> = this.stageStore.stage;
    $stageNeedsRefresh: Signal<boolean | null> = this.stageStore.stageNeedsRefresh;
    $stageTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;
    $stageStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageStatuses;


    constructor(private route: ActivatedRoute, private stageStoreOld: Store<StageState>,
                private confirmationService: ConfirmationService, private router: Router) {
        effect(() => {
            if (this.$stageNeedsRefresh()) {
                this.stageStore.loadStage({});
            }
        })
    }

    ngOnInit(): void {
        let maybeStageId = this.route.snapshot.paramMap.get('stageId');
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.stageId = Number(maybeStageId);
        this.projectId = Number(maybeProjectId);

        this.stageStore.setProjectId(this.projectId);
        this.stageStore.setStageId(this.stageId);

        this.stageStore.loadStage({});
        this.configurationStore.loadConfiguration({});
    }

    deleteStage($event: StageDto) {
        let projectId = this.projectId;
        let stageId = this.stageId;
        this.confirmationService.confirm({
            message: `Do you want to delete stage ${stageId}?`,
            header: `Confirm stage delete ${stageId}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.stageStore.setProjectId(projectId);
                this.stageStore.setStageId(stageId);
                this.stageStore.deleteStage({});
                this.router.navigate([`/projects/${this.projectId}`]);
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }

    rejectStage($event: StageDto) {
        let projectId = this.projectId;
        let stageId = this.stageId;
        this.confirmationService.confirm({
            message: `Do you want to reject stage ${stageId}?`,
            header: `Confirm stage reject ${stageId}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.stageStore.setProjectId(projectId);
                this.stageStore.setStageId(stageId);
                this.stageStore.rejectStage({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }

    reopenStage($event: StageDto) {
        let projectId = this.projectId;
        let stageId = this.stageId;
        this.confirmationService.confirm({
            message: `Do you want to reopen stage ${stageId}?`,
            header: `Confirm stage reopen ${stageId}`,
            icon: "pi pi-info-circle text-red-300",
            accept: () => {
                this.stageStore.setProjectId(projectId);
                this.stageStore.setStageId(stageId);
                this.stageStore.reopenStage({});
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        })
    }

    updateStage($event: Stage) {
        this.stageStore.updateStage({stage: $event});
    }

}
