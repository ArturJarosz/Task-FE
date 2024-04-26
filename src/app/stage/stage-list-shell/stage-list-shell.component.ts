import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getStageStatusConfiguration,
    getStageTypeConfiguration
} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";

@Component({
    selector: 'stage-list-shell',
    templateUrl: './stage-list-shell.component.html',
    styleUrl: './stage-list-shell.component.less'
})
export class StageListShellComponent implements OnInit{
    @Input()
    stages: Array<Stage> | null = null;
    @Input()
    projectId: number = 0;

    stageStatuses$!: Observable<ConfigurationEntry[]>;
    stageTypes$!: Observable<ConfigurationEntry[]>;

    constructor(private configurationStore: Store<ConfigurationState>) {
    }


    ngOnInit(): void {
        this.stageTypes$ = this.configurationStore.select(getStageTypeConfiguration);
        this.stageStatuses$ = this.configurationStore.select(getStageStatusConfiguration);
    }
}
