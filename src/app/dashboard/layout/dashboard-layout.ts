// The dashboard is a list of rows. A row holds stacks whose widths add up to at most 100%; a stack holds up to three
// widgets on top of each other, which share its width and split the row's height. A row is as tall as its tallest
// stack. The layout is saved per user as the DASHBOARD_LAYOUT user configuration.

export type WidgetWidth = 25 | 50 | 75 | 100;

export const WIDGET_WIDTHS: readonly WidgetWidth[] = [25, 50, 75, 100];

export const MAX_STACK_SIZE = 3;

export type DashboardWidgetType = 'active-projects-kpi' | 'income-kpi' | 'expenses-kpi' | 'balance-kpi'
    | 'finance-chart' | 'year-summary' | 'upcoming-events' | 'active-projects';

export interface DashboardWidget {
    type: DashboardWidgetType;
}

export interface DashboardStack {
    width: WidgetWidth;
    widgets: DashboardWidget[];
}

export interface DashboardRow {
    stacks: DashboardStack[];
}

export interface DashboardLayout {
    rows: DashboardRow[];
}

// Where a widget sits: row, stack in the row, place in the stack (all from 0)
export interface WidgetPosition {
    row: number;
    stack: number;
    index: number;
}

export interface DashboardWidgetDefinition {
    type: DashboardWidgetType;
    name: string;
    description: string;
    // PrimeIcons classes, e.g. "pi pi-folder"
    icon: string;
    defaultWidth: WidgetWidth;
    // Charts and tables get unreadable below this width
    minWidth: WidgetWidth;
}

// Each widget can be placed once; the order here is the order of the "Add widget" list
export const DASHBOARD_WIDGETS: readonly DashboardWidgetDefinition[] = [
    {
        type: 'active-projects-kpi', name: 'Active projects count', icon: 'pi pi-folder',
        description: 'Projects to do or in progress, out of all projects', defaultWidth: 25, minWidth: 25
    },
    {
        type: 'income-kpi', name: 'Income this year', icon: 'pi pi-arrow-down-left',
        description: 'Gross income since 1 January', defaultWidth: 25, minWidth: 25
    },
    {
        type: 'expenses-kpi', name: 'Expenses this year', icon: 'pi pi-arrow-up-right',
        description: 'Gross expenses since 1 January', defaultWidth: 25, minWidth: 25
    },
    {
        type: 'balance-kpi', name: 'Balance this year', icon: 'pi pi-wallet',
        description: 'Gross income minus expenses since 1 January', defaultWidth: 25, minWidth: 25
    },
    {
        type: 'finance-chart', name: 'Income and expenses chart', icon: 'pi pi-chart-bar',
        description: 'Bar chart per month, quarter or year', defaultWidth: 75, minWidth: 50
    },
    {
        type: 'year-summary', name: 'Year summary', icon: 'pi pi-list',
        description: 'Income, expenses and balance so far this year', defaultWidth: 25, minWidth: 25
    },
    {
        type: 'upcoming-events', name: 'Upcoming events', icon: 'pi pi-calendar',
        description: 'The next 5 calendar events in the coming 90 days', defaultWidth: 50, minWidth: 25
    },
    {
        type: 'active-projects', name: 'Active projects table', icon: 'pi pi-table',
        description: 'The 5 most recently changed active projects', defaultWidth: 50, minWidth: 50
    },
];

// What a user sees until they save their own layout
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
    rows: [
        {
            stacks: [
                {width: 25, widgets: [{type: 'active-projects-kpi'}]},
                {width: 25, widgets: [{type: 'income-kpi'}]},
                {width: 25, widgets: [{type: 'expenses-kpi'}]},
                {width: 25, widgets: [{type: 'balance-kpi'}]},
            ]
        },
        {stacks: [{width: 75, widgets: [{type: 'finance-chart'}]}, {width: 25, widgets: [{type: 'year-summary'}]}]},
        {stacks: [{width: 50, widgets: [{type: 'upcoming-events'}]}, {width: 50, widgets: [{type: 'active-projects'}]}]},
    ]
};

// Bump when the saved format changes, and read the older versions in parseDashboardLayout.
// Version 1 had no stacks: rows held widgets with their own width.
const LAYOUT_VERSION = 2;
const ROW_WIDTH = 100;

export function widgetDefinition(type: DashboardWidgetType): DashboardWidgetDefinition {
    return DASHBOARD_WIDGETS.find(definition => definition.type === type)!;
}

// A stack can't be narrower than the minimum width of any widget in it
export function stackMinWidth(stack: DashboardStack): WidgetWidth {
    return stack.widgets.reduce<number>((min, widget) => Math.max(min, widgetDefinition(widget.type).minWidth), 25) as WidgetWidth;
}

export function freeWidth(row: DashboardRow): number {
    return ROW_WIDTH - row.stacks.reduce((sum, stack) => sum + stack.width, 0);
}

// Widgets not on the dashboard yet
export function availableWidgets(layout: DashboardLayout): DashboardWidgetDefinition[] {
    const placed = new Set(layout.rows.flatMap(row => row.stacks.flatMap(stack => stack.widgets.map(widget => widget.type))));
    return DASHBOARD_WIDGETS.filter(definition => !placed.has(definition.type));
}

// The width something gets in a row: its preferred width, narrowed to the free space; null when even its minimum
// doesn't fit
export function fittingWidth(minWidth: number, preferred: WidgetWidth, free: number): WidgetWidth | null {
    const fitting = WIDGET_WIDTHS.filter(width => width >= minWidth && width <= free);
    if (fitting.length === 0) {
        return null;
    }
    return fitting.includes(preferred) ? preferred : fitting.filter(width => width <= preferred).pop() ?? fitting[0];
}

// Widths a stack can switch to without overflowing its row
export function allowedStackWidths(layout: DashboardLayout, rowIndex: number, stackIndex: number): WidgetWidth[] {
    const row = layout.rows[rowIndex];
    const stack = row.stacks[stackIndex];
    const room = freeWidth(row) + stack.width;
    return WIDGET_WIDTHS.filter(width => width >= stackMinWidth(stack) && width <= room);
}

export function addRow(layout: DashboardLayout): DashboardLayout {
    return {rows: [...layout.rows, {stacks: []}]};
}

export function removeRow(layout: DashboardLayout, rowIndex: number): DashboardLayout {
    return {rows: layout.rows.filter((_, index) => index !== rowIndex)};
}

export function moveRow(layout: DashboardLayout, from: number, to: number): DashboardLayout {
    if (to < 0 || to >= layout.rows.length || from === to) {
        return layout;
    }
    const rows = [...layout.rows];
    rows.splice(to, 0, ...rows.splice(from, 1));
    return {rows};
}

// Adds the widget as a new stack at the end of the row
export function addWidget(layout: DashboardLayout, rowIndex: number, type: DashboardWidgetType): DashboardLayout {
    const definition = widgetDefinition(type);
    const width = fittingWidth(definition.minWidth, definition.defaultWidth, freeWidth(layout.rows[rowIndex]));
    if (width === null || !availableWidgets(layout).includes(definition)) {
        return layout;
    }
    const result = cloneLayout(layout);
    result.rows[rowIndex].stacks.push({width, widgets: [{type}]});
    return result;
}

// Removes the widget, and its stack once it is empty
export function removeWidget(layout: DashboardLayout, position: WidgetPosition): DashboardLayout {
    const result = cloneLayout(layout);
    result.rows[position.row].stacks[position.stack].widgets.splice(position.index, 1);
    return dropEmptyStacks(result);
}

export function removeStack(layout: DashboardLayout, rowIndex: number, stackIndex: number): DashboardLayout {
    const result = cloneLayout(layout);
    result.rows[rowIndex].stacks.splice(stackIndex, 1);
    return result;
}

export function setStackWidth(layout: DashboardLayout, rowIndex: number, stackIndex: number, width: WidgetWidth): DashboardLayout {
    if (!allowedStackWidths(layout, rowIndex, stackIndex).includes(width)) {
        return layout;
    }
    const result = cloneLayout(layout);
    result.rows[rowIndex].stacks[stackIndex].width = width;
    return result;
}

// Whether a stack can move into the row, narrowed to the free space if needed
export function canMoveStack(layout: DashboardLayout, fromRow: number, fromStack: number, toRow: number): boolean {
    const stack = layout.rows[fromRow]?.stacks[fromStack];
    const target = layout.rows[toRow];
    if (!stack || !target) {
        return false;
    }
    return fromRow === toRow || fittingWidth(stackMinWidth(stack), stack.width, freeWidth(target)) !== null;
}

export function moveStack(layout: DashboardLayout, fromRow: number, fromStack: number, toRow: number,
                          toIndex: number): DashboardLayout {
    if (!canMoveStack(layout, fromRow, fromStack, toRow)) {
        return layout;
    }
    const result = cloneLayout(layout);
    const [stack] = result.rows[fromRow].stacks.splice(fromStack, 1);
    if (fromRow !== toRow) {
        stack.width = fittingWidth(stackMinWidth(stack), stack.width, freeWidth(layout.rows[toRow]))!;
    }
    insertAt(result.rows[toRow].stacks, toIndex, stack);
    return result;
}

// Whether a widget can join the stack: stacks hold up to MAX_STACK_SIZE widgets and are never narrower than any of them
export function canMoveWidgetToStack(layout: DashboardLayout, from: WidgetPosition, toRow: number, toStack: number): boolean {
    const widget = widgetAt(layout, from);
    const target = layout.rows[toRow]?.stacks[toStack];
    if (!widget || !target) {
        return false;
    }
    if (from.row === toRow && from.stack === toStack) {
        return true;
    }
    return target.widgets.length < MAX_STACK_SIZE && target.width >= widgetDefinition(widget.type).minWidth;
}

// Moves a widget within its stack or into another one; a stack it leaves empty is removed
export function moveWidgetToStack(layout: DashboardLayout, from: WidgetPosition, toRow: number, toStack: number,
                                  toIndex: number): DashboardLayout {
    if (!canMoveWidgetToStack(layout, from, toRow, toStack)) {
        return layout;
    }
    const result = cloneLayout(layout);
    const [widget] = result.rows[from.row].stacks[from.stack].widgets.splice(from.index, 1);
    insertAt(result.rows[toRow].stacks[toStack].widgets, toIndex, widget);
    return dropEmptyStacks(result);
}

// Gives a widget a stack of its own at the end of the row, as wide as the stack it leaves if there is room;
// unchanged if even its minimum width doesn't fit
export function moveWidgetToNewStack(layout: DashboardLayout, from: WidgetPosition, toRow: number): DashboardLayout {
    const widget = widgetAt(layout, from);
    if (!widget || !layout.rows[toRow]) {
        return layout;
    }
    const result = cloneLayout(layout);
    result.rows[from.row].stacks[from.stack].widgets.splice(from.index, 1);
    dropEmptyStacks(result);
    const preferred = layout.rows[from.row].stacks[from.stack].width;
    const width = fittingWidth(widgetDefinition(widget.type).minWidth, preferred, freeWidth(result.rows[toRow]));
    if (width === null) {
        return layout;
    }
    result.rows[toRow].stacks.push({width, widgets: [widget]});
    return result;
}

// Takes a widget out of its stack into a new stack right after it. The new stack uses the row's free space first,
// then narrows the stack it came from; unchanged if neither leaves room
export function unstackWidget(layout: DashboardLayout, from: WidgetPosition): DashboardLayout {
    const row = layout.rows[from.row];
    const stack = row?.stacks[from.stack];
    const widget = stack?.widgets[from.index];
    if (!widget || stack.widgets.length < 2) {
        return layout;
    }
    const remaining: DashboardStack = {...stack, widgets: stack.widgets.filter((_, index) => index !== from.index)};
    const free = freeWidth(row);
    for (const width of [...WIDGET_WIDTHS].reverse()) {
        const rest = stack.width - Math.max(0, width - free);
        if (width > stack.width || width < widgetDefinition(widget.type).minWidth || rest < stackMinWidth(remaining)) {
            continue;
        }
        const result = cloneLayout(layout);
        result.rows[from.row].stacks.splice(from.stack, 1,
            {width: rest as WidgetWidth, widgets: remaining.widgets}, {width, widgets: [widget]});
        return result;
    }
    return layout;
}

export function serializeDashboardLayout(layout: DashboardLayout): string {
    const rows = layout.rows
        .map(row => ({
            stacks: row.stacks
                .filter(stack => stack.widgets.length > 0)
                .map(stack => ({width: stack.width, widgets: stack.widgets.map(({type}) => ({type}))}))
        }))
        .filter(row => row.stacks.length > 0);
    return JSON.stringify({version: LAYOUT_VERSION, rows});
}

// Reads a saved layout, version 1 included. Widgets this version doesn't know, repeats, widgets past the stack limit
// and widths that don't fit are dropped or fixed, so a layout saved by another app version still opens; null when the
// value isn't a layout at all
export function parseDashboardLayout(value: string | null | undefined): DashboardLayout | null {
    if (!value) {
        return null;
    }
    let saved: any;
    try {
        saved = JSON.parse(value);
    } catch {
        return null;
    }
    if (!Array.isArray(saved?.rows) || (saved.version !== 1 && saved.version !== LAYOUT_VERSION)) {
        return null;
    }
    const placed = new Set<DashboardWidgetType>();
    const rows: DashboardRow[] = [];
    for (const savedRow of saved.rows) {
        const savedStacks: any[] = saved.version === 1
            ? asArray(savedRow?.widgets).map(widget => ({width: widget?.width, widgets: [widget]}))
            : asArray(savedRow?.stacks);
        const row: DashboardRow = {stacks: []};
        for (const savedStack of savedStacks) {
            const widgets: DashboardWidget[] = [];
            for (const savedWidget of asArray(savedStack?.widgets)) {
                const definition = DASHBOARD_WIDGETS.find(candidate => candidate.type === savedWidget?.type);
                if (definition && !placed.has(definition.type) && !widgets.some(widget => widget.type === definition.type)
                    && widgets.length < MAX_STACK_SIZE) {
                    widgets.push({type: definition.type});
                }
            }
            if (widgets.length === 0) {
                continue;
            }
            const stack: DashboardStack = {width: 25, widgets};
            const preferred = WIDGET_WIDTHS.includes(savedStack.width)
                ? savedStack.width
                : widgetDefinition(widgets[0].type).defaultWidth;
            const width = fittingWidth(stackMinWidth(stack), preferred, freeWidth(row));
            if (width !== null) {
                row.stacks.push({width, widgets});
                widgets.forEach(widget => placed.add(widget.type));
            }
        }
        if (row.stacks.length > 0) {
            rows.push(row);
        }
    }
    return {rows};
}

function widgetAt(layout: DashboardLayout, position: WidgetPosition): DashboardWidget | undefined {
    return layout.rows[position.row]?.stacks[position.stack]?.widgets[position.index];
}

function cloneLayout(layout: DashboardLayout): DashboardLayout {
    return {rows: layout.rows.map(row => ({stacks: row.stacks.map(stack => ({...stack, widgets: [...stack.widgets]}))}))};
}

function dropEmptyStacks(layout: DashboardLayout): DashboardLayout {
    layout.rows.forEach(row => row.stacks = row.stacks.filter(stack => stack.widgets.length > 0));
    return layout;
}

function insertAt<T>(items: T[], index: number, item: T): void {
    items.splice(Math.min(Math.max(index, 0), items.length), 0, item);
}

function asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
}
