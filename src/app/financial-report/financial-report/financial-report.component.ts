import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";
import {FinancialReportPeriod} from "../../generated/models/financial-report-period";
import {FinancialReportCategoryGroup} from "../../generated/models/financial-report-category-group";
import {FinancialPartialData} from "../../generated/models/financial-partial-data";
import {EmptyStateComponent, LoadErrorComponent, KpiCardComponent, PageCrumb, PageHeaderComponent} from "../../shared";
import {DatePickerModule} from "primeng/datepicker";
import {ChartModule} from "primeng/chart";
import {TableModule} from "primeng/table";
import {SkeletonModule} from "primeng/skeleton";
import {FormsModule} from "@angular/forms";
import {NgClass, CurrencyPipe, DatePipe} from "@angular/common";
import {
    barChartOptions,
    closeBarSpacing,
    cssColor,
    currentPeriodIndex,
    expenseAmount,
    periodLabel,
    rebuildOnThemeChange,
    stackedSegmentShapes
} from "../../shared/utils/chart-utils";
import {updateAtMidnight} from "../../shared/utils/date-utils";

type ValueType = 'gross' | 'net';

interface SummaryRow {
    label: string;
    grossValue: number;
    netValue: number;
    incomeTax: number;
    vatTax: number;
    kind: 'header' | 'item' | 'total' | 'balance';
    // Tailwind class of the legend dot for item rows
    dotClass?: string;
}

interface CategoryDef {
    key: keyof FinancialReportCategoryGroup;
    label: string;
    // CSS custom property from the @theme block in styles.css, and the matching Tailwind class for legends
    colorVar: string;
    dotClass: string;
}

// Fixed series order: color follows the category, never its rank (see styles.css --color-chart-*)
const INCOME_CATEGORIES: CategoryDef[] = [
    {key: 'installment', label: 'Installments', colorVar: '--color-chart-1', dotClass: 'bg-chart-1'},
    {key: 'supply', label: 'Supplies', colorVar: '--color-chart-2', dotClass: 'bg-chart-2'},
    {key: 'contractorJob', label: 'Contractor jobs', colorVar: '--color-chart-3', dotClass: 'bg-chart-3'},
    {key: 'supervision', label: 'Supervision', colorVar: '--color-chart-4', dotClass: 'bg-chart-4'},
    // Paid costs that the client reimburses; the backend already sends them in income.cost
    {key: 'cost', label: 'Reimbursed costs', colorVar: '--color-chart-6', dotClass: 'bg-chart-6'},
];

const EXPENSE_CATEGORIES: CategoryDef[] = [
    {key: 'cost', label: 'Costs', colorVar: '--color-chart-5', dotClass: 'bg-chart-5'},
];

@Component({
    selector: 'financial-report-view',
    templateUrl: './financial-report.component.html',
    styleUrl: './financial-report.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, LoadErrorComponent, EmptyStateComponent, KpiCardComponent, DatePickerModule, ChartModule, TableModule, SkeletonModule, FormsModule, NgClass, CurrencyPipe, DatePipe]
})
export class FinancialReportComponent implements OnInit, OnChanges {
    @Input()
    financialReport!: FinancialReport | null;
    @Input()
    startDate!: Date;
    @Input()
    endDate!: Date;
    @Input()
    periodType!: PeriodType;
    @Input()
    loading: boolean = false;
    @Input()
    loadFailed: boolean = false;

    @Output()
    reloadReport = new EventEmitter<void>();
    @Output()
    dateRangeChange = new EventEmitter<{ startDate: Date, endDate: Date }>();
    @Output()
    periodTypeChange = new EventEmitter<PeriodType>();

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Financial report'}];
    readonly periodTypeOptions = [
        {label: 'Monthly', value: PeriodType.MONTHLY},
        {label: 'Quarterly', value: PeriodType.QUARTERLY},
        {label: 'Yearly', value: PeriodType.YEARLY},
    ];
    readonly valueTypeOptions: { label: string, value: ValueType }[] = [
        {label: 'Gross', value: 'gross'},
        {label: 'Net', value: 'net'},
    ];
    readonly legendItems = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

    selectedRange: Date[] = [];
    selectedValueType: ValueType = 'gross';
    periods: FinancialReportPeriod[] = [];
    // Index of the period that contains today (-1 when it isn't in the range); its x-axis label is highlighted
    currentPeriod: number = -1;

    chartData: any = {};
    chartOptions: any = {};
    summaryRows: SummaryRow[] = [];

    constructor() {
        rebuildOnThemeChange(() => {
            this.chartOptions = barChartOptions(true, () => this.currentPeriod);
            this.buildChartData();
        });
        // A new day may start a new period; new chart data makes the chart redraw its labels
        updateAtMidnight(() => this.buildChartData());
    }

    ngOnInit(): void {
        this.selectedRange = [this.startDate, this.endDate];
    }

    ngOnChanges({financialReport, startDate, endDate}: SimpleChanges): void {
        if (financialReport && this.financialReport) {
            this.periods = this.financialReport.periods || [];
            this.buildChartData();
            this.buildSummaryRows();
        }
        if (startDate || endDate) {
            this.selectedRange = [this.startDate, this.endDate];
        }
    }

    get hasData(): boolean {
        return this.periods.length > 0;
    }

    kpiValue(data: FinancialPartialData | undefined): number {
        return (this.selectedValueType === 'gross' ? data?.grossValue : data?.netValue) ?? 0;
    }

    onRangeChange(range: Date[] | null): void {
        // The range picker emits once with only a start date; wait for both ends
        if (range && range[0] && range[1]) {
            this.dateRangeChange.emit({startDate: range[0], endDate: range[1]});
        }
    }

    onPeriodTypeChange(periodType: PeriodType): void {
        if (periodType !== this.periodType) {
            this.periodTypeChange.emit(periodType);
        }
    }

    onValueTypeChange(valueType: ValueType): void {
        this.selectedValueType = valueType;
        this.buildChartData();
    }

    private buildChartData(): void {
        this.currentPeriod = currentPeriodIndex(this.periods);
        const valueField = this.selectedValueType === 'gross' ? 'grossValue' : 'netValue';
        const surface = cssColor('--color-white') || 'white';
        const valueOf = (group: FinancialReportCategoryGroup | undefined, key: keyof FinancialReportCategoryGroup) =>
            ((group?.[key] as FinancialPartialData | undefined)?.[valueField]) || 0;

        // Two stacks per period, side by side like the dashboard chart: income and expenses, both up from zero
        const series = [
            ...INCOME_CATEGORIES.map(category => ({
                category, stack: 'income',
                values: this.periods.map(period => valueOf(period.income, category.key))
            })),
            ...EXPENSE_CATEGORIES.map(category => ({
                category, stack: 'expense',
                values: this.periods.map(period => expenseAmount(valueOf(period.expense, category.key)))
            })),
        ];
        const shapes = stackedSegmentShapes(series);

        this.chartData = {
            labels: this.periods.map(period => periodLabel(period.startDate, this.periodType, true)),
            datasets: series.map(({category, stack, values}, index) => {
                const color = cssColor(category.colorVar);
                return {
                    type: 'bar',
                    label: category.label,
                    backgroundColor: color,
                    hoverBackgroundColor: color,
                    // The gaps between segments are borders in the surface colour
                    borderColor: surface,
                    ...shapes[index],
                    data: values.map(value => value === 0 ? null : value),
                    stack,
                    // Income and expenses of a period sit close together
                    ...closeBarSpacing(2, 24, 6),
                    borderSkipped: false,
                };
            })
        };
    }

    private buildSummaryRows(): void {
        const total = (label: string, data: FinancialPartialData | undefined, kind: 'total' | 'balance'): SummaryRow => ({
            label,
            grossValue: data?.grossValue || 0,
            netValue: data?.netValue || 0,
            incomeTax: data?.incomeTax || 0,
            vatTax: data?.vatTax || 0,
            kind,
        });
        const header = (label: string): SummaryRow =>
            ({label, grossValue: 0, netValue: 0, incomeTax: 0, vatTax: 0, kind: 'header'});
        const item = (groupType: 'income' | 'expense') => (category: CategoryDef): SummaryRow =>
            ({label: category.label, ...this.aggregateCategory(groupType, category.key), kind: 'item', dotClass: category.dotClass});

        this.summaryRows = [
            header('Income'),
            ...INCOME_CATEGORIES.map(item('income')),
            total('Total income', this.financialReport?.totalIncome, 'total'),
            header('Expenses'),
            ...EXPENSE_CATEGORIES.map(item('expense')),
            total('Total expenses', this.financialReport?.totalExpense, 'total'),
            total('Balance', this.financialReport?.totalBalance, 'balance'),
        ];
    }

    private aggregateCategory(groupType: 'income' | 'expense', categoryKey: keyof FinancialReportCategoryGroup) {
        let grossValue = 0, netValue = 0, incomeTax = 0, vatTax = 0;
        for (const period of this.periods) {
            const partial = period[groupType]?.[categoryKey] as FinancialPartialData | undefined;
            if (partial) {
                grossValue += partial.grossValue || 0;
                netValue += partial.netValue || 0;
                incomeTax += partial.incomeTax || 0;
                vatTax += partial.vatTax || 0;
            }
        }
        return {grossValue, netValue, incomeTax, vatTax};
    }
}
