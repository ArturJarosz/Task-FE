import {PeriodType} from "../../generated/models/period-type";
import './chart-tooltip';

// Shared look of the income/expense bar charts on the dashboard and the financial report

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const PLN = new Intl.NumberFormat('pl-PL', {style: 'currency', currency: 'PLN', minimumFractionDigits: 2});
const PLN_SHORT = new Intl.NumberFormat('pl-PL', {maximumFractionDigits: 0});

// Value of a CSS custom property from the @theme block in styles.css
export function cssColor(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// X-axis label of a report period that starts on `startDate` (yyyy-mm-dd): "Oct", "Q4" or "2026", plus the year when asked
export function periodLabel(startDate: string | undefined, periodType: PeriodType | undefined, withYear: boolean): string {
    if (!startDate) {
        return '';
    }
    const [year, month] = startDate.split('-').map(Number);
    const suffix = withYear ? ` ${year}` : '';
    if (periodType === PeriodType.MONTHLY) {
        return `${MONTHS[month - 1]}${suffix}`;
    }
    if (periodType === PeriodType.QUARTERLY) {
        return `${QUARTERS[Math.ceil(month / 3) - 1]}${suffix}`;
    }
    return `${year}`;
}

// Bar chart options in the app theme; expenses may come in negative, the tooltip always shows amounts as positive
export function barChartOptions(stacked: boolean): any {
    const tick = cssColor('--color-gray-500');
    const font = {family: 'Outfit, system-ui, sans-serif', size: 13};
    return {
        maintainAspectRatio: false,
        interaction: {mode: 'index', intersect: false},
        plugins: {
            legend: {display: false},
            tooltip: {
                // Beside the hovered bars, so it never covers the data it explains
                position: 'beside',
                backgroundColor: cssColor('--color-gray-800'),
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
            x: {stacked, ticks: {color: tick, font}, grid: {display: false}, border: {display: false}},
            y: {
                stacked,
                ticks: {color: tick, font, callback: (value: number) => PLN_SHORT.format(value)},
                grid: {color: cssColor('--color-gray-100')},
                border: {display: false}
            }
        }
    };
}
