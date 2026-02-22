import {Component, inject, Input, OnInit, Signal} from '@angular/core';
import {ConfigurationStore} from "../../shared/configuration/state";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageStore} from "../state";
import {StageDto} from "../model/stage";
import {ConfirmationService} from "primeng/api";
import {Router} from "@angular/router";
import {ArchitectStore} from "../../architect/state/architect.state";
import {Architect} from "../../generated/models/architect";
import {StageListComponent} from "../stage-list/stage-list.component";
import {AddStageComponent} from "../add-stage/add-stage.component";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
    selector: 'stage-list-shell',
    templateUrl: './stage-list-shell.component.html',
    styleUrl: './stage-list-shell.component.less',
    standalone: true,
    imports: [StageListComponent, AddStageComponent, ButtonModule, ConfirmDialogModule]
})
export class StageListShellComponent implements OnInit {
    @Input()
    stages: Array<Stage> | null = null;
    @Input()
    projectId: number = 0;

    readonly stageStore = inject(StageStore);
    readonly configurationStore = inject(ConfigurationStore);
    readonly architectStore = inject(ArchitectStore);
    $stageStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageStatuses;
    $stageTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.stageTypes;
    $architects: Signal<Architect[]> = this.architectStore.architects;

    showAddStageComponent: boolean = false;

    constructor(private confirmationService: ConfirmationService, private router: Router) {
    }

    ngOnInit(): void {
        this.configurationStore.loadConfiguration({});
        this.architectStore.loadArchitects({});
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
