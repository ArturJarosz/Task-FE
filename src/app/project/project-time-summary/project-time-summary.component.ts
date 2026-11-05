import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CurrencyPipe} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {RouterLink} from "@angular/router";
import {ProjectTimeSummary} from "../../generated/models/project-time-summary";
import {DurationPipe, EmptyStateComponent} from "../../shared";

// A figure in the card's footer; a rate is missing while no time is logged
export interface TimeFigure {
    label: string;
    kind: 'money' | 'duration';
    value: number | null;
}

// "Time and rate" card on the project overview: the time spent and what the project earned per hour. The time of each
// stage is in the Stages tab, which the card links to
@Component({
    selector: 'project-time-summary',
    templateUrl: './project-time-summary.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, EmptyStateComponent, CurrencyPipe, DurationPipe, RouterLink]
})
export class ProjectTimeSummaryComponent implements OnChanges {
    @Input()
    projectId: number | null = null;
    @Input()
    timeSummary: ProjectTimeSummary | null = null;
    @Input()
    loading: boolean = false;
    @Input()
    loadFailed: boolean = false;
    @Output()
    reload = new EventEmitter<void>();

    figures: TimeFigure[] = toFigures(null);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['timeSummary']) {
            this.figures = toFigures(this.timeSummary);
        }
    }
}

// The time spent, then the two rates it gives, like Value, Paid and Outstanding in the Payments card
function toFigures(timeSummary: ProjectTimeSummary | null): TimeFigure[] {
    return [
        {label: 'Time spent', kind: 'duration', value: timeSummary?.totalMinutes ?? 0},
        {label: 'Net value / h', kind: 'money', value: timeSummary?.netValuePerHour ?? null},
        {label: 'Contract / h', kind: 'money', value: timeSummary?.contractValuePerHour ?? null},
    ];
}
