import {Component, inject, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {
    ConfigurationState,
    getStageStatusConfiguration,
    getStageTypeConfiguration
} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageStore} from "../state";
import {StageDto} from "../model/stage";
import {ConfirmationService} from "primeng/api";
import {Router} from "@angular/router";

@Component({
    selector: 'stage-list-shell',
    templateUrl: './stage-list-shell.component.html',
    styleUrl: './stage-list-shell.component.less'
})
export class StageListShellComponent implements OnInit {
    @Input()
    stages: Array<Stage> | null = null;
    @Input()
    projectId: number = 0;

    stageStore = inject(StageStore);

    stageStatuses$!: Observable<ConfigurationEntry[]>;
    stageTypes$!: Observable<ConfigurationEntry[]>;
    showAddStageComponent: boolean = false;

    constructor(private configurationStore: Store<ConfigurationState>,
                private confirmationService: ConfirmationService, private router: Router) {
    }

    ngOnInit(): void {
        this.stageTypes$ = this.configurationStore.select(getStageTypeConfiguration);
        this.stageStatuses$ = this.configurationStore.select(getStageStatusConfiguration);
        this.stageStore.setProjectId(this.projectId);
    }

    onAddStage() {
        this.showAddStageComponent = true;
    }

    onNotify(event: boolean) {
        this.showAddStageComponent = false;
    }

    onDelete($event: StageDto) {
        let projectId = this.projectId;
        let stageId = $event.stageId;
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
