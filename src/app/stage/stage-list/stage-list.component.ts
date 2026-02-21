import {Component, EventEmitter, Input, Output} from "@angular/core";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageDto} from "../model/stage";
import {Architect} from "../../generated/models/architect";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

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
    architects!: Architect[] | null;
    @Input()
    projectId: number = 0;
    @Output()
    deleteStageEvent: EventEmitter<StageDto> = new EventEmitter<StageDto>();

    getStageLabelType(type: string): string {
        return resolveLabel(type, this.stageTypes);
    }

    getStageStatusLabel(type: string): string {
        return resolveLabel(type, this.stageStatuses);
    }

    getArchitectInitials(architectId?: number): string {
        if (!architectId) return ARCHITECT_NOT_FOUND_INITIAL;
        const architect = this.architects?.find(a => a.id === architectId);
        if (architect?.firstName && architect?.lastName) {
            return `${architect.firstName.charAt(0)}${architect.lastName.charAt(0)}`.toUpperCase();
        }
        return ARCHITECT_NOT_FOUND_INITIAL;
    }

    getArchitectName(architectId?: number): string {
        if (!architectId) return '';
        const architect = this.architects?.find(a => a.id === architectId);
        if (architect?.firstName && architect?.lastName) {
            return `${architect.firstName} ${architect.lastName}`;
        }
        return '';
    }

    deleteTask($event: MouseEvent, stageName: string, stageId: number) {
        $event.stopPropagation();
        this.deleteStageEvent.emit({stageName: stageName, stageId: stageId});
    }
}
