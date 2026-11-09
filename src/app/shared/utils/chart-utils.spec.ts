import {
    currentPeriodIndex,
    expenseAmount,
    periodLabel,
    periodTitle,
    stackedSegmentShapes,
    stackLabelLines
} from './chart-utils';
import {PeriodType} from '../../generated/models/period-type';

describe('periodLabel', () => {
    it('adds the short year like the timeline months when asked', () => {
        expect(periodLabel('2026-10-01', PeriodType.MONTHLY, true)).toBe("Oct'26");
        expect(periodLabel('2026-10-01', PeriodType.QUARTERLY, true)).toBe("Q4'26");
    });

    it('keeps the leading zero of the short year', () => {
        expect(periodLabel('2005-01-01', PeriodType.MONTHLY, true)).toBe("Jan'05");
    });

    it('leaves the year out when not asked, and shows the full year for a yearly period', () => {
        expect(periodLabel('2026-10-01', PeriodType.MONTHLY, false)).toBe('Oct');
        expect(periodLabel('2026-01-01', PeriodType.YEARLY, true)).toBe('2026');
    });

    it('is empty without a start date', () => {
        expect(periodLabel(undefined, PeriodType.MONTHLY, true)).toBe('');
    });
});

describe('currentPeriodIndex', () => {
    const periods = [
        {startDate: '2026-09-01', endDate: '2026-09-30'},
        {startDate: '2026-10-01', endDate: '2026-10-31'},
    ];

    beforeEach(() => jasmine.clock().install());
    afterEach(() => jasmine.clock().uninstall());

    it('finds the period that contains today', () => {
        jasmine.clock().mockDate(new Date(Date.UTC(2026, 9, 15, 10)));
        expect(currentPeriodIndex(periods)).toBe(1);
    });

    it('counts the start and end dates as part of the period, as the backend does, by the date in Warsaw', () => {
        // 23:59 and 00:01 in Warsaw (UTC+2 in summer time), whatever the time zone of the machine
        jasmine.clock().mockDate(new Date(Date.UTC(2026, 8, 30, 21, 59)));
        expect(currentPeriodIndex(periods)).toBe(0);
        jasmine.clock().mockDate(new Date(Date.UTC(2026, 8, 30, 22, 1)));
        expect(currentPeriodIndex(periods)).toBe(1);
    });

    it('is -1 when today is outside every period or a period has no dates', () => {
        jasmine.clock().mockDate(new Date(Date.UTC(2026, 10, 1, 12)));
        expect(currentPeriodIndex(periods)).toBe(-1);
        expect(currentPeriodIndex([{startDate: '2026-11-01'}])).toBe(-1);
    });
});

describe('expenseAmount', () => {
    it('draws an expense as a positive amount, whatever sign the backend sends', () => {
        expect(expenseAmount(-4200)).toBe(4200);
        expect(expenseAmount(4200)).toBe(4200);
    });
});

describe('stackedSegmentShapes', () => {
    const noGap = 0;
    const gap = {top: 2, bottom: 0, left: 0, right: 0};
    const roundTop = {topLeft: 4, topRight: 4};
    const roundBottom = {bottomLeft: 4, bottomRight: 4};
    // One period: two income segments, a negative income correction and one expense
    const shapes = stackedSegmentShapes([
        {stack: 'income', values: [100]},
        {stack: 'income', values: [50]},
        {stack: 'income', values: [-20]},
        {stack: 'expense', values: [30]},
    ]);
    const shape = (index: number) => ({
        borderWidth: shapes[index].borderWidth({dataIndex: 0}),
        borderRadius: shapes[index].borderRadius({dataIndex: 0}),
    });

    it('rounds only the top segment of a stack, and gives it no gap so the rounding shows', () => {
        expect(shape(1)).toEqual({borderWidth: noGap, borderRadius: roundTop});
    });

    it('gives a lower segment a gap under the segment above and no rounding', () => {
        expect(shape(0)).toEqual({borderWidth: gap, borderRadius: 0});
    });

    it('shapes a negative value by its sign: below zero, rounded at the bottom, with a gap under the zero line', () => {
        expect(shape(2)).toEqual({borderWidth: gap, borderRadius: roundBottom});
    });

    it('shapes each stack on its own', () => {
        expect(shape(3)).toEqual({borderWidth: noGap, borderRadius: roundTop});
    });

    it('skips periods where a series has no value', () => {
        const [first, second] = stackedSegmentShapes([
            {stack: 'income', values: [100, 100]},
            {stack: 'income', values: [50, 0]},
        ]);
        expect(first.borderRadius({dataIndex: 1})).toEqual(roundTop);
        expect(second.borderRadius({dataIndex: 0})).toEqual(roundTop);
    });
});

describe('periodTitle', () => {
    it('should name the whole period', () => {
        expect(periodTitle('2026-10-01', PeriodType.MONTHLY)).toBe('October 2026');
        expect(periodTitle('2026-10-01', PeriodType.QUARTERLY)).toBe('Q4 2026');
        expect(periodTitle('2026-01-01', PeriodType.YEARLY)).toBe('2026');
        expect(periodTitle(undefined, PeriodType.MONTHLY)).toBe('');
    });
});

describe('stackLabelLines', () => {
    // Period 0 has every value, period 1 has no installments and no income at all in period 2
    const chart = {
        data: {
            datasets: [
                {stack: 'income', data: [100, null, null]},
                {stack: 'income', data: [50, 20, null]},
                {stack: 'expense', data: [30, 10, 5]},
                {stack: 'expense', data: [40, null, 6]},
            ]
        }
    };
    const lines = (datasetIndex: number, dataIndex: number) => stackLabelLines({chart, datasetIndex, dataIndex});

    it('should label the first item of each stack, with an empty line before the second stack', () => {
        expect(lines(0, 0)).toEqual(['INCOME']);
        expect(lines(1, 0)).toEqual([]);
        expect(lines(2, 0)).toEqual(['', 'EXPENSES']);
        expect(lines(3, 0)).toEqual([]);
    });

    it('should skip items without a value when finding the first item of a stack', () => {
        expect(lines(1, 1)).toEqual(['INCOME']);
        expect(lines(2, 2)).toEqual(['EXPENSES']);
    });

    it('should add nothing for datasets without a stack', () => {
        expect(stackLabelLines({chart: {data: {datasets: [{data: [1]}]}}, datasetIndex: 0, dataIndex: 0})).toEqual([]);
    });
});
