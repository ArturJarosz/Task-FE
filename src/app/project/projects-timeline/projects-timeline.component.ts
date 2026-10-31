import {AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {DatePipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {startOfDay} from "date-fns";
import {TooltipModule} from "primeng/tooltip";
import {ConfigurationEntry, Project} from "../../generated/models";
import {resolveLabel} from "../../shared/utils/label-utils";
import {updateAtMidnight} from "../../shared/utils/date-utils";
import {isDate, spanOf, TimelineScale, TimelineSpan, toDay} from "../timeline/timeline-scale";

// Width of the label column, also where the track starts
const LABEL_COLUMN_PX = 320;

// One project: its contract row and its project row, each from its own dates only
export interface ProjectTimelineGroup {
    id: number;
    name: string;
    contract: TimelineSpan;
    contractDeadline?: Date;
    contractStatusLabel: string;
    work: TimelineSpan;
    projectStatusLabel: string;
}

// The timeline view of the Projects page: a contract and a project row for each project it gets
// (DESIGN_GUIDELINES.md, "Projects page views")
@Component({
    selector: 'projects-timeline',
    templateUrl: './projects-timeline.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TooltipModule, RouterLink, DatePipe, NgTemplateOutlet]
})
export class ProjectsTimelineComponent implements OnChanges, AfterViewChecked {
    @Input()
    projects: Project[] = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    contractStatuses: ConfigurationEntry[] | null = [];

    @ViewChild('scroller')
    scroller?: ElementRef<HTMLElement>;

    readonly labelColumnPx = LABEL_COLUMN_PX;
    today: Date = startOfDay(new Date());
    scale: TimelineScale = new TimelineScale(this.today);
    groups: ProjectTimelineGroup[] = [];

    // Set when the rows change, so the chart scrolls to today once it is drawn
    private scrollPending = false;

    constructor() {
        // Today moves at midnight: redraw then, so the Today line and the open bars stay right
        updateAtMidnight(() => this.refresh());
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.refresh();
        // Only new rows scroll back to today: new status labels keep where the user scrolled to
        if (changes['projects']) {
            this.scrollPending = true;
        }
    }

    ngAfterViewChecked(): void {
        if (this.scrollPending && this.scroller) {
            this.scrollPending = false;
            this.scrollToToday(this.scroller.nativeElement);
        }
    }

    get anyDateError(): boolean {
        return this.groups.some(group => !!group.contract.dateError || !!group.work.dateError);
    }

    refresh(): void {
        this.today = startOfDay(new Date());
        let groups = (this.projects ?? []).map(project => this.toGroup(project));
        // Only rows with a start are drawn, so a deadline or end of a row without one ("No start date yet") never
        // stretches the chart past what it shows
        let dates = groups.flatMap(group => [
            ...(group.contract.start ? [group.contract.start, group.contract.end, group.contractDeadline] : []),
            ...(group.work.start ? [group.work.start, group.work.end] : [])
        ]).filter(isDate);
        // Today is always on the chart, so every group shows where it stands now
        this.scale = dates.length ? TimelineScale.around(dates, true, this.today) : new TimelineScale(this.today);
        this.groups = groups.map(group => ({
            ...group,
            contract: this.scale.placeSpan(group.contract, group.contractDeadline),
            // A project has no deadline of its own
            work: this.scale.placeSpan(group.work)
        }));
    }

    // Only as far as it takes to bring today within the first two thirds of the visible track, so the start of the
    // bars (and their labels) stays in view whenever today allows it
    scrollToToday(scroller: HTMLElement): void {
        let todayLeft = this.scale.todayLeft;
        let visibleTrack = scroller.clientWidth - LABEL_COLUMN_PX;
        if (todayLeft === null || scroller.scrollWidth <= scroller.clientWidth || visibleTrack <= 0) {
            scroller.scrollLeft = 0;
            return;
        }
        let todayPx = (scroller.scrollWidth - LABEL_COLUMN_PX) * todayLeft / 100;
        scroller.scrollLeft = Math.max(todayPx - visibleTrack * 2 / 3, 0);
    }

    private toGroup(project: Project): ProjectTimelineGroup {
        let contract = project.contract;
        return {
            id: project.id!,
            name: project.name ?? '',
            contract: spanOf(toDay(contract?.startDate), toDay(contract?.endDate)),
            contractDeadline: toDay(contract?.deadline),
            contractStatusLabel: resolveLabel(contract?.status, this.contractStatuses),
            work: spanOf(toDay(project.startDate), toDay(project.endDate)),
            projectStatusLabel: resolveLabel(project.status, this.projectStatuses)
        };
    }
}
