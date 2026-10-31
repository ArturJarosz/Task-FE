import {PeriodType} from "../../generated/models/period-type";
import './chart-tooltip';
import {ChangeDetectorRef, effect, inject, untracked} from "@angular/core";
import {ThemeService} from "../../theme/theme.service";
import {toTimeZoneString} from "./date-utils";

// Shared look of the income/expense bar charts on the dashboard and the financial report

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const PLN = new Intl.NumberFormat('pl-PL', {style: 'currency', currency: 'PLN', minimumFractionDigits: 2});
const PLN_SHORT = new Intl.NumberFormat('pl-PL', {maximumFractionDigits: 0});

// Value of a CSS custom property from the @theme block in styles.css
export function cssColor(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// Runs `rebuild` now and again whenever the theme repaints (dark mode, brand color): charts copy the CSS colors when
// built, so they would keep the old ones. Call it in a constructor (it needs the component's injection context).
export function rebuildOnThemeChange(rebuild: () => void): void {
    const themeService = inject(ThemeService);
    const changeDetector = inject(ChangeDetectorRef);
    effect(() => {
        themeService.$appliedColors();
        untracked(rebuild);
        changeDetector.markForCheck();
    });
}

// X-axis label of a report period that starts on `startDate` (yyyy-mm-dd): "Oct", "Q4" or "2026", plus the short
// year when asked ("Oct'26", "Q4'26"), like the months of the project timeline
export function periodLabel(startDate: string | undefined, periodType: PeriodType | undefined, withYear: boolean): string {
    if (!startDate) {
        return '';
    }
    const [year, month] = startDate.split('-').map(Number);
    const suffix = withYear ? `'${String(year % 100).padStart(2, '0')}` : '';
    if (periodType === PeriodType.MONTHLY) {
        return `${MONTHS[month - 1]}${suffix}`;
    }
    if (periodType === PeriodType.QUARTERLY) {
        return `${QUARTERS[Math.ceil(month / 3) - 1]}${suffix}`;
    }
    return `${year}`;
}

// The index of the period that contains today, or -1; `periods` have yyyy-mm-dd start and end dates. Today is the
// date in Warsaw, like the dates the app sends, since the backend builds its periods from those
export function currentPeriodIndex(periods: { startDate?: string, endDate?: string }[]): number {
    const today = toTimeZoneString(new Date())!;
    return periods.findIndex(period => !!period.startDate && !!period.endDate
        && period.startDate <= today && today <= period.endDate);
}

// The amount a chart draws for an expense. The backend may send expenses negative, but the charts draw income and
// expenses side by side, both up from zero, so every chart reads expenses through this
export function expenseAmount(value: number): number {
    return Math.abs(value);
}

// One dataset of a stacked bar chart: its stack ("income", "expense") and its value for each period
export interface StackedSeries {
    stack: string;
    values: number[];
}

// How each segment of stacked bars is drawn, for the datasets in `series` (same order). Each segment gets a 2px gap
// under the segment above it, or under the zero line, drawn as a border in the surface colour. Only the outermost
// segment of a stack above and below zero is rounded, 4px at the data end. Chart.js draws the border inside the bar,
// so the top segment gets none, or it would paint over the rounding. A negative value (a correction) goes below zero,
// so segments are shaped by their sign, not by their stack
export function stackedSegmentShapes(series: StackedSeries[]): { borderWidth: (ctx: any) => any, borderRadius: (ctx: any) => any }[] {
    const periodCount = series[0]?.values.length ?? 0;
    // Per period, the outermost series of each stack above (1) or below (-1) zero: Chart.js stacks each side in
    // dataset order, so it is the stack's last series with a value of that sign
    const outermost = (sign: 1 | -1) => Array.from({length: periodCount}, (_, period) => {
        const found: Record<string, number> = {};
        series.forEach(({stack, values}, i) => {
            if (Math.sign(values[period]) === sign) found[stack] = i;
        });
        return found;
    });
    const top = outermost(1);
    const bottom = outermost(-1);
    return series.map(({stack}, index) => {
        const isTop = (ctx: any) => top[ctx.dataIndex][stack] === index;
        return {
            borderWidth: (ctx: any) => isTop(ctx) ? 0 : {top: 2, bottom: 0, left: 0, right: 0},
            borderRadius: (ctx: any) => isTop(ctx) ? {topLeft: 4, topRight: 4}
                : bottom[ctx.dataIndex][stack] === index ? {bottomLeft: 4, bottomRight: 4} : 0,
        };
    });
}

// Bar chart options in the app theme. `currentIndex` is read on every draw: the x-axis label at that index is in the
// today colour, like the timeline's Today label
export function barChartOptions(stacked: boolean, currentIndex: () => number = () => -1): any {
    const tick = cssColor('--color-gray-500');
    const today = cssColor('--color-today');
    // The app's text-xs (14px), the size of the labels around the project timeline
    const font = {family: 'Outfit, system-ui, sans-serif', size: 14};
    return {
        maintainAspectRatio: false,
        interaction: {mode: 'index', intersect: false},
        plugins: {
            legend: {display: false},
            tooltip: {
                // Beside the hovered bars, so it never covers the data it explains
                position: 'beside',
                // Dark tooltip on light pages, light on dark ones: text takes the surface colour
                backgroundColor: cssColor('--color-gray-800'),
                titleColor: cssColor('--color-white'),
                bodyColor: cssColor('--color-white'),
                padding: 12,
                cornerRadius: 8,
                titleFont: {...font, weight: '600'},
                bodyFont: font,
                boxPadding: 4,
                usePointStyle: true,
                filter: (item: any) => item.raw !== null,
                callbacks: {
                    // As drawn: expenses are already positive (expenseAmount), a correction stays negative
                    label: (context: any) => `${context.dataset.label}: ${PLN.format(context.raw as number)}`
                }
            }
        },
        scales: {
            x: {
                stacked,
                ticks: {
                    color: (context: any) => context.index === currentIndex() ? today : tick,
                    font: (context: any) => context.index === currentIndex() ? {...font, weight: '500'} : font
                },
                grid: {display: false},
                border: {display: false}
            },
            y: {
                stacked,
                ticks: {color: tick, font, callback: (value: number) => PLN_SHORT.format(value)},
                grid: {color: cssColor('--color-gray-100')},
                border: {display: false}
            }
        }
    };
}
