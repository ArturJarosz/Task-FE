import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {getStage, getStagesNeedRefresh, loadStage, refreshStage, StageState} from "../state";
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
    stage$!: Observable<Stage | null>;
    stageTypes$!: Observable<ConfigurationEntry[]>;
    stageStatuses$!: Observable<ConfigurationEntry[]>;
    stageNeedsRefresh$!: Observable<boolean>;

    projectId: number = 0;
    stageId: number = 0;

    constructor(private route: ActivatedRoute, private stageStore: Store<StageState>,
                private configurationStore: Store<ConfigurationState>) {
    }

    ngOnInit(): void {
        let maybeStageId = this.route.snapshot.paramMap.get('stageId');
        let maybeProjectId = this.route.snapshot.paramMap.get('projectId');
        this.stageId = Number(maybeStageId);
        this.projectId = Number(maybeProjectId);
        this.stageStore.dispatch(loadStage({projectId: this.projectId, stageId: this.stageId}));

        this.stage$ = this.stageStore.select(getStage);

        this.stageTypes$ = this.configurationStore.select(getStageTypeConfiguration);
        this.stageStatuses$ = this.configurationStore.select(getStageStatusConfiguration);

        this.stageNeedsRefresh$ = this.stageStore.select(getStagesNeedRefresh);

        this.stageNeedsRefresh$.subscribe({
            next: needsRefresh => {
                if (needsRefresh) {
                    this.refreshStage();
                }
            }
        })
    }

    protected refreshStage() {
        this.stageStore.dispatch(loadStage({projectId: this.projectId, stageId: this.stageId}));
    }

}
