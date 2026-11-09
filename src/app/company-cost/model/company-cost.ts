import {format, parseISO, startOfMonth} from "date-fns";
import {CompanyCost} from "../../generated/models/company-cost";
import {CompanyCostKind} from "../../generated/models/company-cost-kind";
import {CompanyCostRepeats} from "../../generated/models/company-cost-repeats";

export const REPEATS_OPTIONS: { label: string, value: CompanyCostRepeats }[] = [
    {label: 'Every month', value: CompanyCostRepeats.MONTHLY},
    {label: 'Every quarter', value: CompanyCostRepeats.QUARTERLY},
    {label: 'Every year', value: CompanyCostRepeats.YEARLY},
];

// "Every month", or "One-time" for a cost that doesn't repeat
export function repeatsLabel(companyCost: CompanyCost): string {
    if (companyCost.kind === CompanyCostKind.ONE_TIME) {
        return 'One-time';
    }
    return REPEATS_OPTIONS.find(option => option.value === companyCost.repeats)?.label ?? 'Repeats';
}

export function isRecurring(companyCost: CompanyCost): boolean {
    return companyCost.kind === CompanyCostKind.RECURRING;
}

// A recurring cost whose end month has passed; it keeps its history but has no charges any more
export function isEnded(companyCost: CompanyCost, today: Date = new Date()): boolean {
    return isRecurring(companyCost) && !!companyCost.endMonth && parseISO(companyCost.endMonth) < startOfMonth(today);
}

// The years a cost has charges in: a one-time cost its own year, a recurring one from its start to its end month, or
// at least to this year without an end month
export function chargeYearRange(companyCost: CompanyCost, today: Date = new Date()): { first: number, last: number } {
    const first = parseISO(companyCost.startMonth ?? companyCost.date!).getFullYear();
    const last = companyCost.endMonth ? parseISO(companyCost.endMonth).getFullYear()
        : isRecurring(companyCost) ? Math.max(today.getFullYear(), first) : first;
    return {first, last};
}

// Dates from the backend are local days ("2026-03-01"), never UTC midnight
export function toDate(isoDate: string | undefined | null): Date | undefined {
    return isoDate ? parseISO(isoDate) : undefined;
}

// "03.2026"
export function monthLabel(isoDate: string | undefined | null): string {
    return isoDate ? format(parseISO(isoDate), 'MM.yyyy') : '';
}

// "From 03.2024", "01.2025 – 06.2026", or the date of a one-time cost
export function periodLabel(companyCost: CompanyCost): string {
    if (!isRecurring(companyCost)) {
        return companyCost.date ? format(parseISO(companyCost.date), 'dd.MM.yyyy') : '';
    }
    return companyCost.endMonth
        ? `${monthLabel(companyCost.startMonth)} – ${monthLabel(companyCost.endMonth)}`
        : `From ${monthLabel(companyCost.startMonth)}`;
}

// The first day of the month as the backend stores months
export function toMonthString(date: Date): string {
    return format(startOfMonth(date), 'yyyy-MM-dd');
}

const REPEATS_MONTHS: Record<CompanyCostRepeats, number> = {
    [CompanyCostRepeats.MONTHLY]: 1,
    [CompanyCostRepeats.QUARTERLY]: 3,
    [CompanyCostRepeats.YEARLY]: 12,
};

// The day a charge in the month is due: the charge day, or the last day of a shorter month (as the backend counts)
export function chargeDate(month: Date, chargeDay: number): Date {
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return new Date(month.getFullYear(), month.getMonth(), Math.min(chargeDay, lastDay));
}

// Charges of a schedule due before today, which "Mark past charges as paid" pays
export function pastChargeDates(repeats: CompanyCostRepeats, startMonth: Date, endMonth: Date | null,
                                chargeDay: number, today: Date = new Date()): Date[] {
    const dates: Date[] = [];
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let month = startOfMonth(startMonth);
    const lastMonth = endMonth ? startOfMonth(endMonth) : null;
    while ((!lastMonth || month <= lastMonth) && chargeDate(month, chargeDay) < day) {
        dates.push(chargeDate(month, chargeDay));
        month = new Date(month.getFullYear(), month.getMonth() + REPEATS_MONTHS[repeats], 1);
    }
    return dates;
}
