import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FinancialReport} from "../../generated/models/financial-report";
import {PeriodType} from "../../generated/models/period-type";
import {FinancialReportPeriod} from "../../generated/models/financial-report-period";
import {FinancialReportCategoryGroup} from "../../generated/models/financial-report-category-group";
import {FinancialPartialData} from "../../generated/models/financial-partial-data";

interface PeriodTypeOption {
    label: string;
    value: PeriodType;
}

interface ValueTypeOption {
    label: string;
    value: 'gross' | 'net';
}

interface SummaryRow {
    label: string;
    grossValue: number;
    netValue: number;
    incomeTax: number;
    vatTax: number;
    isHeader: boolean;
    isBold: boolean;
}

interface CategoryDef {
    key: keyof FinancialReportCategoryGroup;
    label: string;
}

const INCOME_CATEGORIES: CategoryDef[] = [
    {key: 'installment', label: 'Installment'},
    {key: 'supply', label: 'Supply'},
    {key: 'contractorJob', label: 'Contractor Job'},
    {key: 'supervision', label: 'Supervision'}
];

const EXPENSE_CATEGORIES: CategoryDef[] = [
    {key: 'cost', label: 'Cost'}
];

const INCOME_PALETTE: string[] = [
    '#1B3A5C',
    '#2E6BA4',
    '#5A9ED6',
    '#9FC9EB'
];

const INCOME_HOVER_PALETTE: string[] = [
    '#132942',
    '#215489',
    '#4588C0',
    '#7FB8E3'
];

const EXPENSE_PALETTE: string[] = [
    '#B53D2E'
];

const EXPENSE_HOVER_PALETTE: string[] = [
    '#942F22'
];

import {WrapperComponent} from "../../shared";
import {DatePickerModule} from "primeng/datepicker";
import {SelectModule} from "primeng/select";
import {SelectButtonModule} from "primeng/selectbutton";
import {ChartModule} from "primeng/chart";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {NgIf, NgFor, DecimalPipe} from "@angular/common";

@Component({
    selector: 'financial-report-view',
    templateUrl: './financial-report.component.html',
    styleUrl: './financial-report.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [WrapperComponent, DatePickerModule, SelectModule, SelectButtonModule, ChartModule, TableModule, ButtonModule, FormsModule, NgIf, NgFor, DecimalPipe]
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
    @Output()
    generate = new EventEmitter<void>();

    title: string = "Financial Report";
    selectedStartDate!: Date;
    selectedEndDate!: Date;
    selectedPeriodType!: PeriodType;
    periods: FinancialReportPeriod[] = [];

    periodTypeOptions: PeriodTypeOption[] = [
        {label: 'Monthly', value: PeriodType.MONTHLY},
        {label: 'Quarterly', value: PeriodType.QUARTERLY},
        {label: 'Yearly', value: PeriodType.YEARLY}
    ];

    valueTypeOptions: ValueTypeOption[] = [
        {label: 'Gross', value: 'gross'},
        {label: 'Net', value: 'net'}
    ];
    selectedValueType: 'gross' | 'net' = 'gross';

    chartData: any = {};
    chartOptions: any = {};
    summaryRows: SummaryRow[] = [];
    legendItems: { label: string; color: string }[] = [];

    ngOnInit(): void {
        this.selectedStartDate = this.startDate;
        this.selectedEndDate = this.endDate;
        this.selectedPeriodType = this.periodType;
        this.initChartOptions();
    }

    ngOnChanges({financialReport, startDate, endDate, periodType}: SimpleChanges): void {
        if (financialReport && this.financialReport) {
            this.periods = this.financialReport.periods || [];
            this.buildChartData();
            this.buildSummaryRows();
        }
        if (startDate) {
            this.selectedStartDate = this.startDate;
        }
        if (endDate) {
            this.selectedEndDate = this.endDate;
        }
        if (periodType) {
            this.selectedPeriodType = this.periodType;
        }
    }

    onStartDateChange(date: Date): void {
        this.selectedStartDate = date;
        this.dateRangeChange.emit({startDate: this.selectedStartDate, endDate: this.selectedEndDate});
    }

    onEndDateChange(date: Date): void {
        this.selectedEndDate = date;
        this.dateRangeChange.emit({startDate: this.selectedStartDate, endDate: this.selectedEndDate});
    }

    onPeriodTypeChange(periodType: PeriodType): void {
        this.selectedPeriodType = periodType;
        this.periodTypeChange.emit(periodType);
    }

    onGenerate(): void {
        this.generate.emit();
    }

    onValueTypeChange(): void {
        this.buildChartData();
    }

    formatPeriod(period: FinancialReportPeriod): string {
        if (!period.startDate || !period.endDate) {
            return '';
        }
        return `${period.startDate} - ${period.endDate}`;
    }

    private formatChartLabel(period: FinancialReportPeriod): string {
        if (!period.startDate) {
            return this.formatPeriod(period);
        }
        const [year, month] = period.startDate.split('-').map(Number);
        if (this.selectedPeriodType === PeriodType.MONTHLY) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[month - 1]} ${year}`;
        }
        if (this.selectedPeriodType === PeriodType.QUARTERLY) {
            const quarter = Math.ceil(month / 3);
            const romanNumerals = ['I', 'II', 'III', 'IV'];
            return `${romanNumerals[quarter - 1]} ${year}`;
        }
        return `${year}`;
    }

    private initChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceGround = documentStyle.getPropertyValue('--surface-ground') || '#eff3f8';

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw as number;
                            const absValue = Math.abs(value);
                            const formatted = absValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                            return `${context.dataset.label}: ${formatted}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary,
                        callback: (value: number) => {
                            return value.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                        }
                    },
                    grid: {
                        display: true,
                        color: surfaceGround
                    },
                    border: {
                        display: false
                    }
                }
            }
        };
    }

    private buildChartData(): void {
        const labels = this.periods.map(p => this.formatChartLabel(p));
        const valueField = this.selectedValueType === 'gross' ? 'grossValue' : 'netValue';

        // Pre-compute per-period which category index is the topmost non-zero income
        // and bottommost non-zero expense, so we can round only those bars
        const topIncomePerPeriod = this.periods.map((p, pi) => {
            for (let ci = INCOME_CATEGORIES.length - 1; ci >= 0; ci--) {
                const group = p.income;
                const partial = group ? group[INCOME_CATEGORIES[ci].key] as FinancialPartialData | undefined : undefined;
                if (partial?.[valueField]) return ci;
            }
            return -1;
        });

        const bottomExpensePerPeriod = this.periods.map((p, pi) => {
            for (let ci = EXPENSE_CATEGORIES.length - 1; ci >= 0; ci--) {
                const group = p.expense;
                const partial = group ? group[EXPENSE_CATEGORIES[ci].key] as FinancialPartialData | undefined : undefined;
                if (partial?.[valueField]) return ci;
            }
            return -1;
        });

        const incomeDatasets = INCOME_CATEGORIES.map((cat, i) => ({
            type: 'bar',
            label: cat.label,
            backgroundColor: INCOME_PALETTE[i] || INCOME_PALETTE[INCOME_PALETTE.length - 1],
            hoverBackgroundColor: INCOME_HOVER_PALETTE[i] || INCOME_HOVER_PALETTE[INCOME_HOVER_PALETTE.length - 1],
            data: this.periods.map(p => {
                const group = p.income;
                const partial = group ? group[cat.key] as FinancialPartialData | undefined : undefined;
                const val = partial?.[valueField] || 0;
                return val === 0 ? null : val;
            }),
            stack: 'income',
            barThickness: 32,
            borderSkipped: false,
            borderRadius: (ctx: any) => topIncomePerPeriod[ctx.dataIndex] === i
                ? {topLeft: 8, topRight: 8} : 0
        }));

        const expenseDatasets = EXPENSE_CATEGORIES.map((cat, i) => ({
            type: 'bar',
            label: cat.label,
            backgroundColor: EXPENSE_PALETTE[i] || EXPENSE_PALETTE[EXPENSE_PALETTE.length - 1],
            hoverBackgroundColor: EXPENSE_HOVER_PALETTE[i] || EXPENSE_HOVER_PALETTE[EXPENSE_HOVER_PALETTE.length - 1],
            data: this.periods.map(p => {
                const group = p.expense;
                const partial = group ? group[cat.key] as FinancialPartialData | undefined : undefined;
                const val = partial?.[valueField] || 0;
                return val === 0 ? null : -Math.abs(val);
            }),
            stack: 'expense',
            barThickness: 32,
            borderSkipped: false,
            borderRadius: (ctx: any) => bottomExpensePerPeriod[ctx.dataIndex] === i
                ? {bottomLeft: 8, bottomRight: 8} : 0
        }));

        this.chartData = {
            labels,
            datasets: [...incomeDatasets, ...expenseDatasets]
        };

        const incomeItems = INCOME_CATEGORIES.map((cat, i) => ({
            label: cat.label,
            color: INCOME_PALETTE[i] || INCOME_PALETTE[INCOME_PALETTE.length - 1]
        }));
        const expenseItems = EXPENSE_CATEGORIES.map((cat, i) => ({
            label: cat.label,
            color: EXPENSE_PALETTE[i] || EXPENSE_PALETTE[EXPENSE_PALETTE.length - 1]
        }));
        this.legendItems = [...incomeItems, ...expenseItems];
    }

    private buildSummaryRows(): void {
        const rows: SummaryRow[] = [];

        // Income header
        rows.push({label: 'INCOME', grossValue: 0, netValue: 0, incomeTax: 0, vatTax: 0, isHeader: true, isBold: false});

        // Income category rows
        for (const cat of INCOME_CATEGORIES) {
            const agg = this.aggregateCategory('income', cat.key);
            rows.push({label: cat.label, ...agg, isHeader: false, isBold: false});
        }

        // Income total
        const totalIncome = this.financialReport?.totalIncome;
        rows.push({
            label: 'Total Income',
            grossValue: totalIncome?.grossValue || 0,
            netValue: totalIncome?.netValue || 0,
            incomeTax: totalIncome?.incomeTax || 0,
            vatTax: totalIncome?.vatTax || 0,
            isHeader: false,
            isBold: true
        });

        // Expense header
        rows.push({label: 'EXPENSE', grossValue: 0, netValue: 0, incomeTax: 0, vatTax: 0, isHeader: true, isBold: false});

        // Expense category rows
        for (const cat of EXPENSE_CATEGORIES) {
            const agg = this.aggregateCategory('expense', cat.key);
            rows.push({label: cat.label, ...agg, isHeader: false, isBold: false});
        }

        // Expense total
        const totalExpense = this.financialReport?.totalExpense;
        rows.push({
            label: 'Total Expense',
            grossValue: totalExpense?.grossValue || 0,
            netValue: totalExpense?.netValue || 0,
            incomeTax: totalExpense?.incomeTax || 0,
            vatTax: totalExpense?.vatTax || 0,
            isHeader: false,
            isBold: true
        });

        // Balance
        const totalBalance = this.financialReport?.totalBalance;
        rows.push({
            label: 'Balance',
            grossValue: totalBalance?.grossValue || 0,
            netValue: totalBalance?.netValue || 0,
            incomeTax: totalBalance?.incomeTax || 0,
            vatTax: totalBalance?.vatTax || 0,
            isHeader: false,
            isBold: true
        });

        this.summaryRows = rows;
    }

    private aggregateCategory(groupType: 'income' | 'expense', categoryKey: keyof FinancialReportCategoryGroup): { grossValue: number; netValue: number; incomeTax: number; vatTax: number } {
        let grossValue = 0;
        let netValue = 0;
        let incomeTax = 0;
        let vatTax = 0;

        for (const period of this.periods) {
            const group: FinancialReportCategoryGroup | undefined = period[groupType];
            if (group) {
                const partial = group[categoryKey] as FinancialPartialData | undefined;
                if (partial) {
                    grossValue += partial.grossValue || 0;
                    netValue += partial.netValue || 0;
                    incomeTax += partial.incomeTax || 0;
                    vatTax += partial.vatTax || 0;
                }
            }
        }

        return {grossValue, netValue, incomeTax, vatTax};
    }
}
