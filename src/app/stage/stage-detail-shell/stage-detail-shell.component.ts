import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Stage} from "../stage";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";
import {ActivatedRoute} from "@angular/router";
import {getStage, loadStage, StageState} from "../state";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getStageStatusConfiguration,
    getStageTypeConfiguration
} from "../../shared/configuration/state";

@Component({
    selector: 'stage-detail-shell',
    templateUrl: './stage-detail-shell.component.html',
    styleUrls: ['./stage-detail-shell.component.less']
})
export class StageDetailShellComponent implements OnInit {
    stage$!: Observable<Stage | null>;
    stageTypes$!: Observable<ConfigurationEntry[]>;
    stageStatuses$!: Observable<ConfigurationEntry[]>;

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
    }
}
