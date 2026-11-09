import {CompanyCostKind} from '../../generated/models/company-cost-kind';
import {CompanyCostRepeats} from '../../generated/models/company-cost-repeats';
import {chargeDate, chargeYearRange, isEnded, pastChargeDates, periodLabel, repeatsLabel, toMonthString} from './company-cost';

describe('company cost model', () => {
    const recurring = {kind: CompanyCostKind.RECURRING, repeats: CompanyCostRepeats.MONTHLY, startMonth: '2024-03-01'};

    it('should label how a cost repeats', () => {
        expect(repeatsLabel(recurring)).toBe('Every month');
        expect(repeatsLabel({...recurring, repeats: CompanyCostRepeats.YEARLY})).toBe('Every year');
        expect(repeatsLabel({kind: CompanyCostKind.ONE_TIME})).toBe('One-time');
    });

    it('should label the period of recurring and one-time costs', () => {
        expect(periodLabel(recurring)).toBe('From 03.2024');
        expect(periodLabel({...recurring, startMonth: '2025-01-01', endMonth: '2026-06-01'})).toBe('01.2025 – 06.2026');
        expect(periodLabel({kind: CompanyCostKind.ONE_TIME, date: '2026-10-06'})).toBe('06.10.2026');
    });

    it('should count a cost as ended only after its end month', () => {
        const today = new Date(2026, 10, 7);
        expect(isEnded({...recurring, endMonth: '2026-10-01'}, today)).toBeTrue();
        expect(isEnded({...recurring, endMonth: '2026-11-01'}, today)).toBeFalse();
        expect(isEnded(recurring, today)).toBeFalse();
    });

    it('should put a charge on the last day of a shorter month', () => {
        expect(chargeDate(new Date(2026, 1, 1), 31)).toEqual(new Date(2026, 1, 28));
        expect(chargeDate(new Date(2024, 1, 1), 31)).toEqual(new Date(2024, 1, 29));
        expect(chargeDate(new Date(2026, 4, 1), 15)).toEqual(new Date(2026, 4, 15));
    });

    it('should list the charges due before today', () => {
        const today = new Date(2026, 10, 15);
        const monthly = pastChargeDates(CompanyCostRepeats.MONTHLY, new Date(2026, 8, 20), null, 15, today);
        expect(monthly).toEqual([new Date(2026, 8, 15), new Date(2026, 9, 15)]);
        const quarterly = pastChargeDates(CompanyCostRepeats.QUARTERLY, new Date(2026, 0, 1), null, 1, today);
        expect(quarterly.length).toBe(4);
        const ended = pastChargeDates(CompanyCostRepeats.MONTHLY, new Date(2026, 0, 1), new Date(2026, 1, 1), 1, today);
        expect(ended.length).toBe(2);
    });

    it('should send months as their first day', () => {
        expect(toMonthString(new Date(2026, 2, 17))).toBe('2026-03-01');
    });

    it('should give the years a cost has charges in', () => {
        const today = new Date(2026, 10, 8);
        const recurring = {kind: CompanyCostKind.RECURRING, startMonth: '2024-03-01'};

        expect(chargeYearRange(recurring, today)).toEqual({first: 2024, last: 2026});
        expect(chargeYearRange({...recurring, startMonth: '2027-02-01'}, today)).toEqual({first: 2027, last: 2027});
        expect(chargeYearRange({...recurring, endMonth: '2025-06-01'}, today)).toEqual({first: 2024, last: 2025});
        expect(chargeYearRange({kind: CompanyCostKind.ONE_TIME, date: '2025-04-10'}, today))
            .toEqual({first: 2025, last: 2025});
    });
});
