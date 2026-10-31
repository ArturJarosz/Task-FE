import {
    ActiveElement,
    Chart,
    ChartType,
    Plugin,
    Point,
    Tooltip,
    TooltipModel,
    TooltipPosition,
    TooltipPositionerFunction
} from 'chart.js';
import {toFont, toPadding} from 'chart.js/helpers';

declare module 'chart.js' {
    interface TooltipPositionerMap {
        beside: TooltipPositionerFunction<ChartType>;
    }
}

const GAP = 8;
// The tooltip size is only known after the first draw; assume at least this width before that
const MIN_TOOLTIP_WIDTH = 180;

// Tooltip next to the hovered bar group instead of on top of it: on its left, or on its right
// when there is no room on the left (the first periods of the chart).
// Use with `plugins.tooltip.position: 'beside'`; importing this file registers it.
Tooltip.positioners.beside = function (this: TooltipModel<ChartType>, elements: readonly ActiveElement[],
                                       eventPosition: Point): TooltipPosition | false {
    if (!elements.length) {
        return false;
    }
    let left = Infinity;
    let right = -Infinity;
    for (const {element} of elements) {
        const {x, width} = element.getProps(['x', 'width'], true) as { x: number, width: number };
        left = Math.min(left, x - width / 2);
        right = Math.max(right, x + width / 2);
    }
    const area = this.chart.chartArea;
    // Follow the pointer vertically, kept inside the plot area
    const pointerY = eventPosition.y ?? (area.top + area.bottom) / 2;
    const y = Math.min(Math.max(pointerY, area.top), area.bottom);
    const fitsOnLeft = left - GAP - Math.max(this.width, MIN_TOOLTIP_WIDTH) >= 0;
    return fitsOnLeft
        ? {x: left - GAP, y, xAlign: 'right', yAlign: 'center'}
        : {x: right + GAP, y, xAlign: 'left', yAlign: 'center'};
};

// Space between a tooltip's title and its first line: 6px, the 1px divider, 6px. The default `titleMarginBottom` of
// every chart, so tooltipTitleDivider always has room for the line
export const TOOLTIP_TITLE_MARGIN = 13;

// A line between a tooltip's title and the lines under it, in the title colour at 25% (DESIGN_GUIDELINES.md, "Charts",
// Tooltip; HTML tooltips get it from .app-tooltip-title). Importing this file registers it for every chart.
const tooltipTitleDivider: Plugin = {
    id: 'tooltipTitleDivider',
    afterTooltipDraw(chart, {tooltip}) {
        const titleLines = tooltip.title?.length ?? 0;
        if (!titleLines || !tooltip.body?.length || !tooltip.opacity) {
            return;
        }
        // Resolved by the time the tooltip draws, so no scriptable values are left (the types still allow them)
        const options = tooltip.options as any;
        const padding = toPadding(options.padding);
        const titleHeight = titleLines * toFont(options.titleFont).lineHeight + (titleLines - 1) * options.titleSpacing;
        // Halfway through the margin, on a whole pixel so the 1px line stays sharp
        const y = Math.round(tooltip.y + padding.top + titleHeight + (options.titleMarginBottom - 1) / 2) + 0.5;
        const ctx = chart.ctx;
        ctx.save();
        ctx.globalAlpha = 0.25 * tooltip.opacity;
        ctx.strokeStyle = options.titleColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tooltip.x + padding.left, y);
        ctx.lineTo(tooltip.x + tooltip.width - padding.right, y);
        ctx.stroke();
        ctx.restore();
    }
};
Chart.register(tooltipTitleDivider);
// The room for that line, on every chart the plugin draws on, not only those built from barChartOptions
Chart.defaults.plugins.tooltip.titleMarginBottom = TOOLTIP_TITLE_MARGIN;
