import {
    addWidget,
    allowedStackWidths,
    availableWidgets,
    DashboardLayout,
    DEFAULT_DASHBOARD_LAYOUT,
    moveRow,
    moveStack,
    moveWidgetToNewStack,
    moveWidgetToStack,
    parseDashboardLayout,
    removeWidget,
    serializeDashboardLayout,
    setStackWidth,
    unstackWidget
} from './dashboard-layout';

describe('dashboard layout', () => {
    // Row 1: two 25% KPIs, 50% free. Row 2: the chart next to a stack of two widgets, full
    const layout: DashboardLayout = {
        rows: [
            {stacks: [{width: 25, widgets: [{type: 'income-kpi'}]}, {width: 25, widgets: [{type: 'expenses-kpi'}]}]},
            {
                stacks: [
                    {width: 50, widgets: [{type: 'finance-chart'}]},
                    {width: 50, widgets: [{type: 'year-summary'}, {type: 'upcoming-events'}]},
                ]
            },
        ]
    };
    const types = (layout: DashboardLayout, row: number) =>
        layout.rows[row].stacks.map(stack => stack.width + ':' + stack.widgets.map(widget => widget.type).join('+'));

    describe('parseDashboardLayout', () => {
        it('should read a layout it saved', () => {
            expect(parseDashboardLayout(serializeDashboardLayout(layout))).toEqual(layout);
            expect(parseDashboardLayout(serializeDashboardLayout(DEFAULT_DASHBOARD_LAYOUT))).toEqual(DEFAULT_DASHBOARD_LAYOUT);
        });

        it('should turn each widget of a version 1 layout into a stack of its own', () => {
            const saved = '{"version":1,"rows":[{"widgets":[{"type":"finance-chart","width":75},{"type":"year-summary","width":25}]}]}';

            expect(parseDashboardLayout(saved)).toEqual({
                rows: [{stacks: [{width: 75, widgets: [{type: 'finance-chart'}]}, {width: 25, widgets: [{type: 'year-summary'}]}]}]
            });
        });

        it('should return null for values that are not a layout of a known version', () => {
            expect(parseDashboardLayout(undefined)).toBeNull();
            expect(parseDashboardLayout('not json')).toBeNull();
            expect(parseDashboardLayout('{"rows":[]}')).toBeNull();
            expect(parseDashboardLayout('{"version":3,"rows":[]}')).toBeNull();
        });

        it('should keep an empty layout empty instead of falling back to the default', () => {
            expect(parseDashboardLayout('{"version":2,"rows":[]}')).toEqual({rows: []});
        });

        it('should drop unknown, repeated and surplus widgets, empty stacks and rows, and fix widths', () => {
            const saved = JSON.stringify({
                version: 2,
                rows: [
                    {stacks: [{width: 30, widgets: [{type: 'weather'}, {type: 'income-kpi'}]}, {width: 25, widgets: []}]},
                    {stacks: [{width: 25, widgets: [{type: 'income-kpi'}]}]},
                    {
                        stacks: [
                            // The chart makes the stack at least 50% wide; the fourth widget is one too many
                            {
                                width: 25, widgets: [{type: 'finance-chart'}, {type: 'balance-kpi'}, {type: 'year-summary'},
                                    {type: 'upcoming-events'}]
                            },
                            {width: 25, widgets: [{type: 'expenses-kpi'}]},
                            // No room left for a 50% table
                            {width: 50, widgets: [{type: 'active-projects'}]},
                        ]
                    },
                ]
            });

            expect(parseDashboardLayout(saved)).toEqual({
                rows: [
                    {stacks: [{width: 25, widgets: [{type: 'income-kpi'}]}]},
                    {
                        stacks: [
                            {width: 50, widgets: [{type: 'finance-chart'}, {type: 'balance-kpi'}, {type: 'year-summary'}]},
                            {width: 25, widgets: [{type: 'expenses-kpi'}]},
                        ]
                    },
                ]
            });
        });
    });

    it('should leave empty stacks and rows out of the saved value', () => {
        const saved = JSON.parse(serializeDashboardLayout({rows: [{stacks: []}, {stacks: [{width: 25, widgets: []}]}, ...layout.rows]}));

        expect(saved.version).toBe(2);
        expect(saved.rows.length).toBe(2);
    });

    it('should list only widgets that are not placed yet', () => {
        expect(availableWidgets(layout).map(definition => definition.type))
            .toEqual(['active-projects-kpi', 'balance-kpi', 'active-projects']);
    });

    describe('addWidget', () => {
        it('should add a widget as a new stack at its default width when it fits', () => {
            expect(types(addWidget(layout, 0, 'active-projects'), 0)).toEqual(['25:income-kpi', '25:expenses-kpi', '50:active-projects']);
        });

        it('should narrow a widget to the free space, but not below its minimum', () => {
            const oneQuarterFree = addWidget(layout, 0, 'balance-kpi');

            expect(addWidget(oneQuarterFree, 0, 'active-projects')).toBe(oneQuarterFree);
            expect(addWidget(oneQuarterFree, 1, 'active-projects-kpi')).toBe(oneQuarterFree);
        });

        it('should not add a widget twice', () => {
            expect(addWidget(layout, 0, 'year-summary')).toBe(layout);
        });
    });

    describe('stack widths', () => {
        it('should offer only widths that fit the row and every widget in the stack', () => {
            expect(allowedStackWidths(layout, 0, 0)).toEqual([25, 50, 75]);
            expect(allowedStackWidths(layout, 1, 0)).toEqual([50]);
        });

        it('should change a width that fits and ignore one that does not', () => {
            expect(setStackWidth(layout, 0, 1, 75).rows[0].stacks[1].width).toBe(75);
            expect(setStackWidth(layout, 1, 0, 75)).toBe(layout);
            expect(setStackWidth(layout, 1, 0, 25)).toBe(layout);
        });
    });

    describe('moveStack', () => {
        it('should reorder stacks within a row', () => {
            expect(types(moveStack(layout, 1, 1, 1, 0), 1)).toEqual(['50:year-summary+upcoming-events', '50:finance-chart']);
        });

        it('should move a stack into a row with room for it, keeping its widgets together', () => {
            const moved = moveStack(layout, 1, 1, 0, 0);

            expect(types(moved, 0)).toEqual(['50:year-summary+upcoming-events', '25:income-kpi', '25:expenses-kpi']);
            expect(types(moved, 1)).toEqual(['50:finance-chart']);
        });

        it('should not move a stack into a row without room for it', () => {
            expect(moveStack(layout, 0, 0, 1, 0)).toBe(layout);
        });
    });

    describe('moving widgets', () => {
        it('should stack a widget onto another stack and remove the stack it leaves empty', () => {
            const moved = moveWidgetToStack(layout, {row: 0, stack: 0, index: 0}, 0, 1, 0);

            expect(types(moved, 0)).toEqual(['25:income-kpi+expenses-kpi']);
        });

        it('should reorder widgets within a stack', () => {
            expect(types(moveWidgetToStack(layout, {row: 1, stack: 1, index: 1}, 1, 1, 0), 1))
                .toEqual(['50:finance-chart', '50:upcoming-events+year-summary']);
        });

        it('should not stack a widget onto a full stack or one narrower than the widget allows', () => {
            const fullStack = moveWidgetToStack(layout, {row: 0, stack: 0, index: 0}, 1, 1, 2);
            expect(types(fullStack, 1)).toEqual(['50:finance-chart', '50:year-summary+upcoming-events+income-kpi']);

            expect(moveWidgetToStack(fullStack, {row: 0, stack: 0, index: 0}, 1, 1, 0)).toBe(fullStack);
            expect(moveWidgetToStack(layout, {row: 1, stack: 0, index: 0}, 0, 0, 0)).toBe(layout);
        });

        it('should give a widget its own stack in a row with room for it', () => {
            const moved = moveWidgetToNewStack(layout, {row: 1, stack: 1, index: 1}, 0);

            expect(types(moved, 0)).toEqual(['25:income-kpi', '25:expenses-kpi', '50:upcoming-events']);
            expect(types(moved, 1)).toEqual(['50:finance-chart', '50:year-summary']);
            expect(moveWidgetToNewStack(layout, {row: 1, stack: 1, index: 1}, 1)).toBe(layout);
        });
    });

    describe('unstackWidget', () => {
        it('should split a full row by narrowing the stack the widget leaves', () => {
            expect(types(unstackWidget(layout, {row: 1, stack: 1, index: 0}), 1))
                .toEqual(['50:finance-chart', '25:upcoming-events', '25:year-summary']);
        });

        it('should use the free space before narrowing the stack', () => {
            const stacked = moveWidgetToStack(layout, {row: 0, stack: 0, index: 0}, 0, 1, 1);

            expect(types(unstackWidget(stacked, {row: 0, stack: 0, index: 1}), 0)).toEqual(['25:expenses-kpi', '25:income-kpi']);
        });

        it('should leave a widget that is alone in its stack', () => {
            expect(unstackWidget(layout, {row: 1, stack: 0, index: 0})).toBe(layout);
        });
    });

    it('should move rows and ignore moves past either end', () => {
        expect(moveRow(layout, 1, 0).rows).toEqual([layout.rows[1], layout.rows[0]]);
        expect(moveRow(layout, 0, -1)).toBe(layout);
        expect(moveRow(layout, 1, 2)).toBe(layout);
    });

    it('should remove a widget, and its stack once empty', () => {
        expect(types(removeWidget(layout, {row: 1, stack: 1, index: 0}), 1)).toEqual(['50:finance-chart', '50:upcoming-events']);
        expect(types(removeWidget(layout, {row: 0, stack: 0, index: 0}), 0)).toEqual(['25:expenses-kpi']);
    });
});
