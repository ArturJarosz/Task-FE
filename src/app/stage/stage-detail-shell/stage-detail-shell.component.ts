import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {StageState, StageStore} from "../state";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getStageStatusConfiguration,
    getStageTypeConfiguration
} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {DeleteStageDto} from "../model/stage";
import {ConfirmationService} from "primeng/api";

@Component({
    selector: 'stage-detail-shell',
    templateUrl: './stage-detail-shell.component.html',
    styleUrls: ['./stage-detail-shell.component.less']
})
export class StageDetailShellComponent implements OnInit {
    projectId!: number;
    stageId!: number;

    stageTypes$!: Observable<ConfigurationEntry[]>;
    stageStatuses$!: Observable<ConfigurationEntry[]>;

    readonly stageStore = inject(StageStore);
    $stage: Signal<Stage | null> = this.stageStore.stage;
    $stageNeedsRefresh: Signal<boolean | null> = this.stageStore.stageNeedsRefresh;


    constructor(private route: ActivatedRoute, private stageStoreOld: Store<StageState>,
                private configurationStore: Store<ConfigurationState>, private confirmationService: ConfirmationService,
                private router: Router) {
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

        this.stageTypes$ = this.configurationStore.select(getStageTypeConfiguration);
        this.stageStatuses$ = this.configurationStore.select(getStageStatusConfiguration);

        this.stageStore.setProjectId(this.projectId);
        this.stageStore.setStageId(this.stageId);

        this.stageStore.loadStage({});
    }

    deleteStage($event: DeleteStageDto) {
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
}
