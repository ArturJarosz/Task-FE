import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";
import {FinancialReportPeriod} from "../../generated/models/financial-report-period";
import {FinancialReportCategoryGroup} from "../../generated/models/financial-report-category-group";
import {FinancialPartialData} from "../../generated/models/financial-partial-data";
import {PageCrumb, PageHeaderComponent} from "../../shared";
import {DatePickerModule} from "primeng/datepicker";
import {ChartModule} from "primeng/chart";
import {TableModule} from "primeng/table";
import {SkeletonModule} from "primeng/skeleton";
import {FormsModule} from "@angular/forms";
import {NgIf, NgFor, NgClass, CurrencyPipe, DatePipe} from "@angular/common";

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
];

const EXPENSE_CATEGORIES: CategoryDef[] = [
    {key: 'cost', label: 'Costs', colorVar: '--color-chart-5', dotClass: 'bg-chart-5'},
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const PLN = new Intl.NumberFormat('pl-PL', {style: 'currency', currency: 'PLN', minimumFractionDigits: 2});
const PLN_SHORT = new Intl.NumberFormat('pl-PL', {maximumFractionDigits: 0});

@Component({
    selector: 'financial-report-view',
    templateUrl: './financial-report.component.html',
    styleUrl: './financial-report.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageHeaderComponent, DatePickerModule, ChartModule, TableModule, SkeletonModule, FormsModule, NgIf, NgFor, NgClass, CurrencyPipe, DatePipe]
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

    chartData: any = {};
    chartOptions: any = {};
    summaryRows: SummaryRow[] = [];

    ngOnInit(): void {
        this.selectedRange = [this.startDate, this.endDate];
        this.initChartOptions();
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

    private formatChartLabel(period: FinancialReportPeriod): string {
        if (!period.startDate) {
            return '';
        }
        const [year, month] = period.startDate.split('-').map(Number);
        if (this.periodType === PeriodType.MONTHLY) {
            return `${MONTHS[month - 1]} ${year}`;
        }
        if (this.periodType === PeriodType.QUARTERLY) {
            return `${QUARTERS[Math.ceil(month / 3) - 1]} ${year}`;
        }
        return `${year}`;
    }

    private cssColor(variable: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }

    private initChartOptions(): void {
        const tick = this.cssColor('--color-gray-500');
        const grid = this.cssColor('--color-gray-100');
        const font = {family: 'Outfit, system-ui, sans-serif', size: 13};
        this.chartOptions = {
            maintainAspectRatio: false,
            interaction: {mode: 'index', intersect: false},
            plugins: {
                legend: {display: false},
                tooltip: {
                    backgroundColor: this.cssColor('--color-gray-800'),
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {...font, weight: '600'},
                    bodyFont: font,
                    boxPadding: 4,
                    usePointStyle: true,
                    filter: (item: any) => item.raw !== null,
                    callbacks: {
                        label: (context: any) => `${context.dataset.label}: ${PLN.format(Math.abs(context.raw as number))}`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {color: tick, font},
                    grid: {display: false},
                    border: {display: false}
                },
                y: {
                    stacked: true,
                    ticks: {color: tick, font, callback: (value: number) => PLN_SHORT.format(value)},
                    grid: {color: grid},
                    border: {display: false}
                }
            }
        };
    }

    private buildChartData(): void {
        const valueField = this.selectedValueType === 'gross' ? 'grossValue' : 'netValue';
        const surface = this.cssColor('--color-white') || 'white';
        const valueOf = (group: FinancialReportCategoryGroup | undefined, key: keyof FinancialReportCategoryGroup) =>
            ((group?.[key] as FinancialPartialData | undefined)?.[valueField]) || 0;

        // Round only the outermost non-zero segment of each stack, 4px at the data end
        const topIncome = this.periods.map(period => {
            for (let i = INCOME_CATEGORIES.length - 1; i >= 0; i--) {
                if (valueOf(period.income, INCOME_CATEGORIES[i].key)) return i;
            }
            return -1;
        });

        const dataset = (category: CategoryDef, index: number, stack: 'income' | 'expense') => {
            const color = this.cssColor(category.colorVar);
            return {
                type: 'bar',
                label: category.label,
                backgroundColor: color,
                hoverBackgroundColor: color,
                // 2px surface gap between stacked segments
                borderColor: surface,
                borderWidth: {top: 2, bottom: 0, left: 0, right: 0},
                data: this.periods.map(period => {
                    const value = valueOf(stack === 'income' ? period.income : period.expense, category.key);
                    return value === 0 ? null : (stack === 'income' ? value : -Math.abs(value));
                }),
                stack,
                maxBarThickness: 28,
                borderSkipped: false,
                borderRadius: (ctx: any) => stack === 'income'
                    ? (topIncome[ctx.dataIndex] === index ? {topLeft: 4, topRight: 4} : 0)
                    : {bottomLeft: 4, bottomRight: 4},
            };
        };

        this.chartData = {
            labels: this.periods.map(period => this.formatChartLabel(period)),
            datasets: [
                ...INCOME_CATEGORIES.map((category, i) => dataset(category, i, 'income')),
                ...EXPENSE_CATEGORIES.map((category, i) => dataset(category, i, 'expense')),
            ]
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
