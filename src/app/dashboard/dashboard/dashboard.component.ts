import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CurrencyPipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {ChartModule} from "primeng/chart";
import {SkeletonModule} from "primeng/skeleton";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {CalendarEvent, Client, ClientType, ConfigurationEntry, FinancialReport, FinancialReportPeriod, Project, ProjectStatus} from "../../generated/models";
import {PeriodType} from "../../generated/models/period-type";
import {EmptyStateComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {resolveLabel} from "../../shared/utils/label-utils";
import {statusSeverity} from "../../shared/status-severity";
import {barChartOptions, cssColor, periodLabel} from "../../shared/utils/chart-utils";
import {eventDay, eventMonth, eventWhen} from "../../shared/utils/event-date-utils";

// Rows shown in the "Upcoming events" and "Active projects" cards; "See all" opens the full page
const LIST_SIZE = 5;
const ACTIVE_STATUSES: ProjectStatus[] = [ProjectStatus.TO_DO, ProjectStatus.IN_PROGRESS];

export interface YearTotals {
    income: number;
    expenses: number;
    balance: number;
}

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, EmptyStateComponent, ButtonModule, ChartModule, SkeletonModule, TableModule, TagModule,
        RouterLink, CurrencyPipe]
})
export class DashboardComponent implements OnInit, OnChanges {
    @Input()
    report: FinancialReport | null = null;
    @Input()
    periodType: PeriodType = PeriodType.MONTHLY;
    @Input()
    reportLoading: boolean = false;
    @Input()
    reportLoadFailed: boolean = false;
    @Input()
    projects: Project[] | null = null;
    @Input()
    projectsLoadFailed: boolean = false;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    upcomingEvents: CalendarEvent[] = [];

    @Output()
    periodTypeChange = new EventEmitter<PeriodType>();
    @Output()
    reloadReport = new EventEmitter<void>();
    @Output()
    reloadProjects = new EventEmitter<void>();

    protected readonly statusSeverity = statusSeverity;
    protected readonly eventDay = eventDay;
    protected readonly eventMonth = eventMonth;
    protected readonly eventWhen = eventWhen;
    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Dashboard'}];
    readonly periodTypeOptions = [
        {label: 'Monthly', value: PeriodType.MONTHLY},
        {label: 'Quarterly', value: PeriodType.QUARTERLY},
        {label: 'Annually', value: PeriodType.YEARLY},
    ];
    readonly currentYear = new Date().getFullYear();

    activeProjects: Project[] = [];
    totalProjects = 0;
    yearTotals: YearTotals = {income: 0, expenses: 0, balance: 0};
    nextEvents: CalendarEvent[] = [];

    chartData: any = {};
    chartOptions: any = {};

    ngOnInit(): void {
        this.chartOptions = barChartOptions(false);
    }

    ngOnChanges({report, projects, upcomingEvents}: SimpleChanges): void {
        if (report) {
            this.yearTotals = this.computeYearTotals();
            this.buildChartData();
        }
        if (projects) {
            const all = this.projects ?? [];
            this.totalProjects = all.length;
            this.activeProjects = all
                .filter(project => !!project.status && ACTIVE_STATUSES.includes(project.status))
                .sort((a, b) => (b.lastModifiedDateTime ?? '').localeCompare(a.lastModifiedDateTime ?? ''));
        }
        if (upcomingEvents) {
            this.nextEvents = (this.upcomingEvents ?? []).slice(0, LIST_SIZE);
        }
    }

    get recentActiveProjects(): Project[] {
        return this.activeProjects.slice(0, LIST_SIZE);
    }

    get hasPeriods(): boolean {
        return (this.report?.periods?.length ?? 0) > 0;
    }

    get chartSubtitle(): string {
        const first = this.report?.periods?.[0]?.startDate?.slice(0, 4);
        const range = first && Number(first) !== this.currentYear ? `${first}–${this.currentYear}` : `${this.currentYear}`;
        return `Gross values, ${range}`;
    }

    onPeriodTypeChange(periodType: PeriodType): void {
        if (periodType !== this.periodType) {
            this.periodTypeChange.emit(periodType);
        }
    }

    getProjectTypeLabel(type?: string): string {
        return resolveLabel(type, this.projectTypes);
    }

    getProjectStatusLabel(status?: string): string {
        return resolveLabel(status, this.projectStatuses);
    }

    getClientName(client?: Client): string {
        if (!client) {
            return '';
        }
        if (client.clientType === ClientType.CORPORATE) {
            return client.companyName ?? '';
        }
        return [client.firstName, client.lastName].filter(Boolean).join(' ');
    }

    getInitials(name: string): string {
        return name.split(' ')
            .filter(part => part.length > 0)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join('') || '?';
    }

    // KPIs always cover the current year, whichever period the chart shows
    private computeYearTotals(): YearTotals {
        const year = String(this.currentYear);
        return (this.report?.periods ?? [])
            .filter(period => period.startDate?.startsWith(year))
            .reduce((totals, period) => {
                const income = this.periodTotal(period, 'income');
                const expenses = this.periodTotal(period, 'expense');
                return {
                    income: totals.income + income,
                    expenses: totals.expenses + expenses,
                    balance: totals.balance + income - expenses,
                };
            }, {income: 0, expenses: 0, balance: 0});
    }

    private periodTotal(period: FinancialReportPeriod, group: 'income' | 'expense'): number {
        const {total, ...categories} = period[group] ?? {};
        // Expenses may come back negative; the chart and KPIs show both as positive amounts
        const gross = total?.grossValue
            ?? Object.values(categories).reduce((sum, data) => sum + (data?.grossValue ?? 0), 0);
        return Math.abs(gross);
    }

    private buildChartData(): void {
        const periods = this.report?.periods ?? [];
        const dataset = (label: string, colorVar: string, group: 'income' | 'expense') => {
            const color = cssColor(colorVar);
            return {
                type: 'bar',
                label,
                backgroundColor: color,
                hoverBackgroundColor: color,
                data: periods.map(period => this.periodTotal(period, group)),
                maxBarThickness: 20,
                borderRadius: {topLeft: 4, topRight: 4},
                borderSkipped: false,
            };
        };
        this.chartData = {
            labels: periods.map(period => periodLabel(period.startDate, this.report?.periodType, false)),
            datasets: [
                dataset('Income', '--color-chart-1', 'income'),
                dataset('Expenses', '--color-chart-5', 'expense'),
            ]
        };
    }
}
