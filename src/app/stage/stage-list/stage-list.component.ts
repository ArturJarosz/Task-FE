import {Component, EventEmitter, Input, Output} from "@angular/core";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {DeleteStageDto} from "../model/stage";

@Component({
    selector: 'stage-list',
    templateUrl: 'stage-list.component.html',
    styleUrls: ['stage-list.component.less']
})
export class StageListComponent {
    @Input()
    stages!: Stage[] | null;
    @Input()
    stageTypes!: ConfigurationEntry[] | null;
    @Input()
    stageStatuses!: ConfigurationEntry[] | null;
    @Input()
    projectId: number = 0;
    @Output()
    deleteStageEvent: EventEmitter<DeleteStageDto> = new EventEmitter<DeleteStageDto>();

    getStageLabelType(type: string): string {
        return resolveLabel(type, this.stageTypes);
    }

    getStageStatusLabel(type: string): string {
        return resolveLabel(type, this.stageStatuses);
    }

    deleteTask($event: MouseEvent, stageName: string, stageId: number) {
        $event.stopPropagation();
        this.deleteStageEvent.emit({stageName: stageName, stageId: stageId});
    }
}
