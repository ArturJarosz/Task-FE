import {PeriodType} from "../../generated/models/period-type";
import './chart-tooltip';
import {ChangeDetectorRef, effect, inject, untracked} from "@angular/core";
import {ThemeService} from "../../theme/theme.service";

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
