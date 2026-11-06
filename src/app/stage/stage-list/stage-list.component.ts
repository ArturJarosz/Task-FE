import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {initials, resolveKnownLabel, resolveLabel} from "../../shared/utils/label-utils";
import {Stage} from "../../generated/models/stage";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {StageDto} from "../model/stage";
import {Architect} from "../../generated/models/architect";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {MenuModule, Menu} from "primeng/menu";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {RouterLink} from "@angular/router";
import {DatePipe} from "@angular/common";
import {DurationPipe, EmptyStateComponent, NotSetComponent} from "../../shared";
import {statusSeverity} from "../../shared/status-severity";
import {parseISO} from "date-fns";
import {TooltipModule} from "primeng/tooltip";
import {fieldValue, SortValue, TableSort, toTableSort} from "../../shared/utils/sort-utils";
import {SortRowsPipe} from "../../shared/sort-rows/sort-rows.pipe";
import {ThreeStepSortDirective} from "../../shared/sort-rows/three-step-sort.directive";

const ARCHITECT_NOT_FOUND_INITIAL = '?';

@Component({
    selector: 'stage-list',
    templateUrl: 'stage-list.component.html',
    styleUrls: ['stage-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ThreeStepSortDirective, SortRowsPipe, TableModule, TagModule, MenuModule, ButtonModule, RouterLink, DatePipe, TooltipModule, EmptyStateComponent, NotSetComponent,
        DurationPipe]
})
export class StageListComponent {

    // Column sort of the table: it is lazy, so it only reports the sort and the sortRows pipe sorts a copy of the rows
    sort: TableSort | null = null;

    readonly sortValue = (row: Stage, field: string): SortValue => {
        switch (field) {
            case 'architect':
                return this.getArchitectName(row.architectId);
            case 'status':
                return this.getStageStatusLabel(row.status ?? '');
            default:
                return fieldValue(row, field);
        }
    };

    onSort(event: TableLazyLoadEvent): void {
        this.sort = toTableSort(event);
    }
    // Kept in time order, like the timeline: by start date, then deadline, then name; stages without dates last
    @Input()
    set stages(stages: Stage[] | null) {
        this.sortedStages = stages ? byTime(stages) : null;
    }
    sortedStages: Stage[] | null = null;
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

    getStageLabelType(typeId: number | undefined): string {
        return resolveKnownLabel(typeId, this.stageTypes);
    }

    getStageStatusLabel(type: string): string {
        return resolveLabel(type, this.stageStatuses);
    }

    getArchitectInitials(architectId?: number): string {
        if (!architectId) return ARCHITECT_NOT_FOUND_INITIAL;
        const architect = this.architects?.find(a => a.id === architectId);
        return architect ? initials(architect.firstName, architect.lastName) : ARCHITECT_NOT_FOUND_INITIAL;
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

function byTime(stages: Stage[]): Stage[] {
    let time = (date?: string) => date ? parseISO(date).getTime() : Infinity;
    return [...stages].sort((a, b) => time(a.startDate) - time(b.startDate)
        || time(a.deadline) - time(b.deadline)
        || (a.name ?? '').localeCompare(b.name ?? '', 'pl'));
}
