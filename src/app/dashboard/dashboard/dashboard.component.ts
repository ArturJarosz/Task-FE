import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CurrencyPipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {MenuItem} from "primeng/api";
import {ButtonModule} from "primeng/button";
import {ChartModule} from "primeng/chart";
import {Menu, MenuModule} from "primeng/menu";
import {SkeletonModule} from "primeng/skeleton";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {TooltipModule} from "primeng/tooltip";
import {CalendarEvent, Client, ClientType, ConfigurationEntry, FinancialReport, FinancialReportPeriod, Project, ProjectStatus} from "../../generated/models";
import {PeriodType} from "../../generated/models/period-type";
import {EmptyStateComponent, KpiCardComponent, PageCrumb, PageHeaderComponent, NotSetComponent} from "../../shared";
import {resolveLabel} from "../../shared/utils/label-utils";
import {statusSeverity} from "../../shared/status-severity";
import {
    barChartOptions,
    cssColor,
    currentPeriodIndex,
    expenseAmount,
    periodLabel,
    rebuildOnThemeChange
} from "../../shared/utils/chart-utils";
import {updateAtMidnight} from "../../shared/utils/date-utils";
import {eventDay, eventMonth, eventWhen} from "../../shared/utils/event-date-utils";
import {isActiveProject} from "../../shared/utils/project-status-utils";
import {
    addRow,
    addWidget,
    allowedStackWidths,
    availableWidgets,
    canMoveStack,
    canMoveWidgetToStack,
    DashboardLayout,
    DashboardRow,
    DashboardStack,
    DashboardWidget,
    DashboardWidgetType,
    fittingWidth,
    freeWidth,
    MAX_STACK_SIZE,
    moveRow,
    moveStack,
    moveWidgetToNewStack,
    moveWidgetToStack,
    removeRow,
    removeStack,
    removeWidget,
    setStackWidth,
    unstackWidget,
    WIDGET_WIDTHS,
    widgetDefinition,
    WidgetPosition,
    WidgetWidth
} from "../layout/dashboard-layout";
import {AddWidgetComponent} from "../add-widget/add-widget.component";

// Rows shown in the "Upcoming events" and "Active projects" cards; "See all" opens the full page
const LIST_SIZE = 5;

// From xl a row is a 4-column grid, so a stack spans a quarter of it per 25%
const XL_SPANS: Record<WidgetWidth, string> = {
    25: 'xl:col-span-1',
    50: 'xl:col-span-2',
    75: 'xl:col-span-3',
    100: 'xl:col-span-4',
};

export interface YearTotals {
    income: number;
    expenses: number;
    balance: number;
}

// A stack's widget list in edit mode
interface StackRef {
    row: number;
    stack: number;
}

interface YearKpi {
    key: keyof YearTotals;
    label: string;
    icon: string;
}

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, EmptyStateComponent, KpiCardComponent, AddWidgetComponent, ButtonModule, ChartModule,
        MenuModule, SkeletonModule, TableModule, TagModule, TooltipModule, CdkDropList, CdkDrag,
        CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, RouterLink, CurrencyPipe, NgTemplateOutlet, NotSetComponent]
})
export class DashboardComponent implements OnChanges {
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
    activeProjectStatuses: ProjectStatus[] | null = [];
    @Input()
    upcomingEvents: CalendarEvent[] = [];
    // The saved layout
    @Input()
    layout: DashboardLayout = {rows: []};
    // The layout being edited; edit mode is on while it is set
    @Input()
    draftLayout: DashboardLayout | null = null;
    @Input()
    layoutLoading: boolean = false;
    @Input()
    layoutSaving: boolean = false;

    @Output()
    periodTypeChange = new EventEmitter<PeriodType>();
    @Output()
    reloadReport = new EventEmitter<void>();
    @Output()
    reloadProjects = new EventEmitter<void>();
    @Output()
    editStart = new EventEmitter<void>();
    @Output()
    editCancel = new EventEmitter<void>();
    @Output()
    editReset = new EventEmitter<void>();
    @Output()
    editSave = new EventEmitter<void>();
    @Output()
    draftLayoutChange = new EventEmitter<DashboardLayout>();

    protected readonly statusSeverity = statusSeverity;
    protected readonly eventDay = eventDay;
    protected readonly eventMonth = eventMonth;
    protected readonly eventWhen = eventWhen;
    protected readonly widgetWidths = WIDGET_WIDTHS;
    protected readonly maxStackSize = MAX_STACK_SIZE;
    protected readonly widgetDefinition = widgetDefinition;
    protected readonly freeWidth = freeWidth;
    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Dashboard'}];
    readonly periodTypeOptions = [
        {label: 'Monthly', value: PeriodType.MONTHLY},
        {label: 'Quarterly', value: PeriodType.QUARTERLY},
        {label: 'Annually', value: PeriodType.YEARLY},
    ];
    readonly currentYear = new Date().getFullYear();
    readonly yearKpis: Partial<Record<DashboardWidgetType, YearKpi>> = {
        'income-kpi': {key: 'income', label: 'Income', icon: 'pi pi-arrow-down-left'},
        'expenses-kpi': {key: 'expenses', label: 'Expenses', icon: 'pi pi-arrow-up-right'},
        'balance-kpi': {key: 'balance', label: 'Balance', icon: 'pi pi-wallet'},
    };

    activeProjects: Project[] = [];
    totalProjects = 0;
    yearTotals: YearTotals = {income: 0, expenses: 0, balance: 0};
    nextEvents: CalendarEvent[] = [];

    chartData: any = {};
    chartOptions: any = {};
    // Index of the period that contains today (-1 when it isn't in the report); its x-axis label is highlighted
    currentPeriod: number = -1;

    // Row the "Add widget" dialog adds to; the dialog is open while it is set
    addWidgetRow: number | null = null;
    rowMenuItems: MenuItem[] = [];
    stackMenuItems: MenuItem[] = [];
    widgetMenuItems: MenuItem[] = [];
    // Stacks are dragged between rows, widgets between stacks and into the free part of a row; the two kinds of
    // drop lists are only connected to their own kind
    rowListIds: string[] = [];
    widgetListIds: string[] = [];

    constructor() {
        rebuildOnThemeChange(() => {
            this.chartOptions = barChartOptions(false, () => this.currentPeriod);
            this.buildChartData();
        });
        // A new day may start a new period; new chart data makes the chart redraw its labels
        updateAtMidnight(() => this.buildChartData());
    }

    ngOnChanges({report, projects, activeProjectStatuses, upcomingEvents, draftLayout}: SimpleChanges): void {
        if (report) {
            this.yearTotals = this.computeYearTotals();
            this.buildChartData();
        }
        if (projects || activeProjectStatuses) {
            const all = this.projects ?? [];
            this.totalProjects = all.length;
            this.activeProjects = all
                .filter(project => isActiveProject(project, this.activeProjectStatuses))
                .sort((a, b) => (b.lastModifiedDateTime ?? '').localeCompare(a.lastModifiedDateTime ?? ''));
        }
        if (upcomingEvents) {
            this.nextEvents = (this.upcomingEvents ?? []).slice(0, LIST_SIZE);
        }
        if (draftLayout) {
            if (!this.draftLayout) {
                this.addWidgetRow = null;
            }
            this.updateDropListIds();
        }
    }

    get editing(): boolean {
        return this.draftLayout !== null;
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

    yearKpi(type: DashboardWidgetType): YearKpi | undefined {
        return this.yearKpis[type];
    }

    // Below md every stack is full width. From md a row is two columns: in rows of only 25% and 50% stacks each
    // takes one (a last odd one spans both), otherwise each spans both. From xl a row is four columns.
    stackClasses(row: DashboardRow, index: number): string {
        const compact = row.stacks.every(stack => stack.width <= 50);
        const lastOdd = index === row.stacks.length - 1 && row.stacks.length % 2 === 1;
        return `${compact && !lastOdd ? 'md:col-span-1' : 'md:col-span-2'} ${XL_SPANS[row.stacks[index].width]}`;
    }

    // The area for new stacks fills the free part of the row
    newStackClasses(row: DashboardRow): string {
        return `md:col-span-2 ${XL_SPANS[freeWidth(row) as WidgetWidth]}`;
    }

    hasNewStackArea(row: DashboardRow): boolean {
        return freeWidth(row) >= 25;
    }

    canAddWidget(row: DashboardRow): boolean {
        const free = freeWidth(row);
        return availableWidgets(this.draftLayout!)
            .some(definition => fittingWidth(definition.minWidth, definition.defaultWidth, free) !== null);
    }

    allowedWidths(rowIndex: number, stackIndex: number): WidgetWidth[] {
        return allowedStackWidths(this.draftLayout!, rowIndex, stackIndex);
    }

    stackName(stack: DashboardStack): string {
        return stack.widgets.map(widget => widgetDefinition(widget.type).name).join(' and ');
    }

    stackListId(rowIndex: number, stackIndex: number): string {
        return `dashboard-stack-${rowIndex}-${stackIndex}`;
    }

    newStackListId(rowIndex: number): string {
        return `dashboard-new-stack-${rowIndex}`;
    }

    // Lets a stack into another row only when that row has room for it, narrowed if needed
    readonly canDropStack = (drag: CdkDrag<DashboardStack>, drop: CdkDropList<number>): boolean => {
        const from = this.findStack(drag.data);
        return !!from && canMoveStack(this.draftLayout!, from.row, from.stack, drop.data);
    };

    readonly canDropWidget = (drag: CdkDrag<DashboardWidget>, drop: CdkDropList<StackRef>): boolean => {
        const from = this.findWidget(drag.data.type);
        return !!from && canMoveWidgetToStack(this.draftLayout!, from, drop.data.row, drop.data.stack);
    };

    readonly canDropWidgetInNewStack = (drag: CdkDrag<DashboardWidget>, drop: CdkDropList<number>): boolean => {
        const from = this.findWidget(drag.data.type);
        return !!from && moveWidgetToNewStack(this.draftLayout!, from, drop.data) !== this.draftLayout;
    };

    onStackDropped(event: CdkDragDrop<number, number, DashboardStack>): void {
        const fromRow = event.previousContainer.data;
        const toRow = event.container.data;
        if (fromRow !== toRow || event.previousIndex !== event.currentIndex) {
            this.changeDraft(moveStack(this.draftLayout!, fromRow, event.previousIndex, toRow, event.currentIndex));
        }
    }

    onWidgetDropped(event: CdkDragDrop<StackRef, StackRef, DashboardWidget>): void {
        const from: WidgetPosition = {...event.previousContainer.data, index: event.previousIndex};
        const to = event.container.data;
        if (from.row !== to.row || from.stack !== to.stack || event.previousIndex !== event.currentIndex) {
            this.changeDraft(moveWidgetToStack(this.draftLayout!, from, to.row, to.stack, event.currentIndex));
        }
    }

    onNewStackDropped(event: CdkDragDrop<number, StackRef, DashboardWidget>): void {
        const from: WidgetPosition = {...event.previousContainer.data, index: event.previousIndex};
        this.changeDraft(moveWidgetToNewStack(this.draftLayout!, from, event.container.data));
    }

    onWidthChange(rowIndex: number, stackIndex: number, width: WidgetWidth): void {
        this.changeDraft(setStackWidth(this.draftLayout!, rowIndex, stackIndex, width));
    }

    onAddRow(): void {
        this.changeDraft(addRow(this.draftLayout!));
    }

    onAddWidget(type: DashboardWidgetType): void {
        this.changeDraft(addWidget(this.draftLayout!, this.addWidgetRow!, type));
        this.addWidgetRow = null;
    }

    openRowMenu(event: Event, rowIndex: number, menu: Menu): void {
        const layout = this.draftLayout!;
        this.rowMenuItems = [
            {
                label: 'Move row up', icon: 'pi pi-arrow-up', disabled: rowIndex === 0,
                command: () => this.changeDraft(moveRow(layout, rowIndex, rowIndex - 1))
            },
            {
                label: 'Move row down', icon: 'pi pi-arrow-down', disabled: rowIndex === layout.rows.length - 1,
                command: () => this.changeDraft(moveRow(layout, rowIndex, rowIndex + 1))
            },
            {separator: true},
            {label: 'Remove row', icon: 'pi pi-trash', command: () => this.changeDraft(removeRow(layout, rowIndex))},
        ];
        menu.toggle(event);
    }

    // The keyboard way to do what dragging a stack does
    openStackMenu(event: Event, rowIndex: number, stackIndex: number, menu: Menu): void {
        const layout = this.draftLayout!;
        const lastIndex = layout.rows[rowIndex].stacks.length - 1;
        const toRow = (target: number) =>
            moveStack(layout, rowIndex, stackIndex, target, layout.rows[target].stacks.length);
        this.stackMenuItems = [
            {
                label: 'Move left', icon: 'pi pi-arrow-left', disabled: stackIndex === 0,
                command: () => this.changeDraft(moveStack(layout, rowIndex, stackIndex, rowIndex, stackIndex - 1))
            },
            {
                label: 'Move right', icon: 'pi pi-arrow-right', disabled: stackIndex === lastIndex,
                command: () => this.changeDraft(moveStack(layout, rowIndex, stackIndex, rowIndex, stackIndex + 1))
            },
            {
                label: 'Move to row above', icon: 'pi pi-arrow-up',
                disabled: rowIndex === 0 || !canMoveStack(layout, rowIndex, stackIndex, rowIndex - 1),
                command: () => this.changeDraft(toRow(rowIndex - 1))
            },
            {
                label: 'Move to row below', icon: 'pi pi-arrow-down',
                disabled: rowIndex === layout.rows.length - 1 || !canMoveStack(layout, rowIndex, stackIndex, rowIndex + 1),
                command: () => this.changeDraft(toRow(rowIndex + 1))
            },
            {separator: true},
            {
                label: layout.rows[rowIndex].stacks[stackIndex].widgets.length > 1 ? 'Remove stack' : 'Remove widget',
                icon: 'pi pi-trash',
                command: () => this.changeDraft(removeStack(layout, rowIndex, stackIndex))
            },
        ];
        menu.toggle(event);
    }

    // The keyboard way to do what dragging a widget does
    openWidgetMenu(event: Event, position: WidgetPosition, menu: Menu): void {
        const layout = this.draftLayout!;
        const {row, stack, index} = position;
        const stacks = layout.rows[row].stacks;
        const stacked = stacks[stack].widgets.length > 1;
        const intoStack = (target: number) =>
            moveWidgetToStack(layout, position, row, target, stacks[target].widgets.length);
        const unstacked = unstackWidget(layout, position);
        this.widgetMenuItems = [
            {
                label: 'Move up', icon: 'pi pi-arrow-up', visible: stacked, disabled: index === 0,
                command: () => this.changeDraft(moveWidgetToStack(layout, position, row, stack, index - 1))
            },
            {
                label: 'Move down', icon: 'pi pi-arrow-down', visible: stacked,
                disabled: index === stacks[stack].widgets.length - 1,
                command: () => this.changeDraft(moveWidgetToStack(layout, position, row, stack, index + 1))
            },
            {
                label: 'Move into stack on the left', icon: 'pi pi-arrow-left',
                disabled: stack === 0 || !canMoveWidgetToStack(layout, position, row, stack - 1),
                command: () => this.changeDraft(intoStack(stack - 1))
            },
            {
                label: 'Move into stack on the right', icon: 'pi pi-arrow-right',
                disabled: stack === stacks.length - 1 || !canMoveWidgetToStack(layout, position, row, stack + 1),
                command: () => this.changeDraft(intoStack(stack + 1))
            },
            {
                label: 'Move out of stack', icon: 'pi pi-external-link', visible: stacked, disabled: unstacked === layout,
                command: () => this.changeDraft(unstacked)
            },
            {separator: true},
            {label: 'Remove widget', icon: 'pi pi-trash', command: () => this.changeDraft(removeWidget(layout, position))},
        ];
        menu.toggle(event);
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

    private changeDraft(layout: DashboardLayout): void {
        if (layout !== this.draftLayout) {
            this.draftLayoutChange.emit(layout);
        }
    }

    private findWidget(type: DashboardWidgetType): WidgetPosition | null {
        const rows = this.draftLayout?.rows ?? [];
        for (let row = 0; row < rows.length; row++) {
            for (let stack = 0; stack < rows[row].stacks.length; stack++) {
                const index = rows[row].stacks[stack].widgets.findIndex(widget => widget.type === type);
                if (index >= 0) {
                    return {row, stack, index};
                }
            }
        }
        return null;
    }

    private findStack(target: DashboardStack): StackRef | null {
        const rows = this.draftLayout?.rows ?? [];
        for (let row = 0; row < rows.length; row++) {
            const stack = rows[row].stacks.indexOf(target);
            if (stack >= 0) {
                return {row, stack};
            }
        }
        return null;
    }

    // Only lists on the page can be connected; the new stack area shows only while the row has free space
    private updateDropListIds(): void {
        const rows = this.draftLayout?.rows ?? [];
        this.rowListIds = rows.map((_, row) => `dashboard-row-${row}`);
        this.widgetListIds = rows.flatMap((row, rowIndex) => [
            ...row.stacks.map((_, stack) => this.stackListId(rowIndex, stack)),
            ...(this.hasNewStackArea(row) ? [this.newStackListId(rowIndex)] : [])
        ]);
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
        const gross = total?.grossValue
            ?? Object.values(categories).reduce((sum, data) => sum + (data?.grossValue ?? 0), 0);
        // Expenses may come back negative; the chart and KPIs show them as positive amounts, like the financial report
        return group === 'expense' ? expenseAmount(gross) : gross;
    }

    private buildChartData(): void {
        const periods = this.report?.periods ?? [];
        this.currentPeriod = currentPeriodIndex(periods);
        const dataset = (label: string, colorVar: string, group: 'income' | 'expense') => {
            const color = cssColor(colorVar);
            return {
                type: 'bar',
                label,
                backgroundColor: color,
                hoverBackgroundColor: color,
                data: periods.map(period => this.periodTotal(period, group)),
                maxBarThickness: 24,
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
