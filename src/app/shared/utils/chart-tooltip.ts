import {ActiveElement, ChartType, Point, Tooltip, TooltipModel, TooltipPosition, TooltipPositionerFunction} from 'chart.js';

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
