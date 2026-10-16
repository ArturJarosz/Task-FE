import {ChangeDetectionStrategy, Component, effect, inject, OnInit, Signal} from '@angular/core';
import {DashboardStore} from "../state/dashboard.state";
import {ProjectStore} from "../../project/state";
import {CalendarStore} from "../../calendar/state";
import {ConfigurationStore} from "../../shared/configuration/state";
import {CalendarEvent, ConfigurationEntry, FinancialReport, Project} from "../../generated/models";
import {PeriodType} from "../../generated/models/period-type";
import {DashboardComponent} from "../dashboard/dashboard.component";

@Component({
    selector: 'dashboard-shell',
    templateUrl: './dashboard-shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DashboardComponent]
})
export class DashboardShellComponent implements OnInit {
    readonly dashboardStore = inject(DashboardStore);
    readonly projectStore = inject(ProjectStore);
    readonly calendarStore = inject(CalendarStore);
    readonly configurationStore = inject(ConfigurationStore);

    $report: Signal<FinancialReport | null> = this.dashboardStore.report;
    $periodType: Signal<PeriodType> = this.dashboardStore.periodType;
    $reportLoading: Signal<boolean> = this.dashboardStore.loading;
    $reportLoadFailed: Signal<boolean> = this.dashboardStore.loadFailed;
    $projects: Signal<Project[]> = this.projectStore.projects;
    $projectsNeedRefresh: Signal<boolean> = this.projectStore.projectsNeedRefresh;
    $projectsLoadFailed: Signal<boolean> = this.projectStore.projectsLoadFailed;
    $upcomingEvents: Signal<CalendarEvent[]> = this.calendarStore.upcomingEvents;
    $upcomingEventsNeedRefresh: Signal<boolean> = this.calendarStore.upcomingEventsNeedRefresh;
    $projectTypes: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectTypes;
    $projectStatuses: Signal<ConfigurationEntry[]> = this.configurationStore.configuration!.projectStatuses;

    constructor() {
        effect(() => {
            if (this.$projectsNeedRefresh()) {
                this.projectStore.loadProjects({});
            }
        });
        effect(() => {
            if (this.$upcomingEventsNeedRefresh()) {
                this.calendarStore.loadUpcomingEvents({});
            }
        });
    }

    ngOnInit(): void {
        this.dashboardStore.loadReport({});
    }

    // Until the first load finishes the store still holds its initial empty list; null shows skeletons instead
    get projects(): Project[] | null {
        return this.$projectsNeedRefresh() ? null : this.$projects();
    }

    onPeriodTypeChange(periodType: PeriodType): void {
        this.dashboardStore.setPeriodType(periodType);
        this.dashboardStore.loadReport({});
    }

    onReloadProjects(): void {
        this.projectStore.loadProjects({});
    }

    onReloadReport(): void {
        this.dashboardStore.loadReport({});
    }
}
