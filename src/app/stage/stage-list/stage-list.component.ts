import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageDto} from "../model/stage";
import {Architect} from "../../generated/models/architect";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {MenuModule, Menu} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {DatePipe} from "@angular/common";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";
import {TooltipModule} from "primeng/tooltip";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

@Component({
    selector: 'stage-list',
    templateUrl: 'stage-list.component.html',
    styleUrls: ['stage-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, TagModule, MenuModule, ButtonModule, RouterLink, DatePipe, TooltipModule, EmptyStateComponent, NotSetComponent]
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

    protected readonly statusSeverity = statusSeverity;
    rowMenuItems: MenuItem[] = [];

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

    openRowMenu($event: MouseEvent, stage: Stage, menu: Menu) {
        $event.stopPropagation();
        this.rowMenuItems = [
            {label: 'Open', icon: 'pi pi-arrow-right', routerLink: ['/projects', this.projectId, 'stages', stage.id]},
            {label: 'Delete stage', icon: 'pi pi-trash', command: () => this.deleteStage(stage.name!, stage.id!)}
        ];
        menu.toggle($event);
    }

    deleteStage(stageName: string, stageId: number) {
        this.deleteStageEvent.emit({stageName: stageName, stageId: stageId});
    }
}
