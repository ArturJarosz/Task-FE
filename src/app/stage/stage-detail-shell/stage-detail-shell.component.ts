import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {StageState, StageStore} from "../state";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getStageStatusConfiguration,
    getStageTypeConfiguration
} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

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
                private configurationStore: Store<ConfigurationState>) {
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

}
