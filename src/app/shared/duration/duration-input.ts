const MINUTES_PER_HOUR = 60;

// The backend's limit for a time entry
export const MAX_DURATION_MINUTES = 24 * MINUTES_PER_HOUR;

export type DurationProblem = 'missing' | 'format' | 'tooLong';

export const DURATION_PROBLEM_MESSAGES: Record<DurationProblem, string> = {
    missing: 'Enter the time spent, at least 1 minute',
    format: 'Enter the time like 2h30m, 2h or 45m',
    tooLong: `The time spent can't be more than 24 hours`,
};

// A number with an optional decimal part, written with a dot or a comma: 2, 1.5, 1,5
const NUMBER = String.raw`\d+(?:[.,]\d+)?`;
// h, hr, hrs, hour, hours
const HOURS_UNIT = String.raw`h(?:ours?|rs?)?`;
// m, min, mins, minute, minutes
const MINUTES_UNIT = String.raw`m(?:in(?:ute)?s?)?`;

// A number on its own counts as hours
const HOURS_ONLY = new RegExp(`^(${NUMBER})$`);
// Hours and/or minutes with their units. After the hours the minutes may go without one: 12h30
const HOURS_AND_MINUTES = new RegExp(
    String.raw`^(?:(${NUMBER})\s*${HOURS_UNIT})?\s*(?:(${NUMBER})\s*(${MINUTES_UNIT})?)?$`);

function toNumber(text: string): number {
    return Number(text.replace(',', '.'));
}

/**
 * Reads time typed by the user as whole minutes: "12h30m", "12h 30m", "12h30", "2h", "45m", "1.5h". A number without a
 * unit counts as hours, so "2" is 120 minutes and "1,5" is 90. Fractions of a minute are rounded. Returns null for empty
 * text or text that is not a duration.
 */
export function parseDuration(text: string | null | undefined): number | null {
    const value = (text ?? '').trim().toLowerCase();
    if (!value) {
        return null;
    }
    const hoursOnly = HOURS_ONLY.exec(value);
    if (hoursOnly) {
        return Math.round(toNumber(hoursOnly[1]) * MINUTES_PER_HOUR);
    }
    const match = HOURS_AND_MINUTES.exec(value);
    if (!match) {
        return null;
    }
    const [, hours, minutes, minutesUnit] = match;
    // a bare number was handled above, so minutes without their unit only follow hours
    if (hours === undefined && (minutes === undefined || minutesUnit === undefined)) {
        return null;
    }
    const total = (hours !== undefined ? toNumber(hours) * MINUTES_PER_HOUR : 0)
        + (minutes !== undefined ? toNumber(minutes) : 0);
    return Math.round(total);
}

// What is wrong with typed time for a time entry: it must be readable, at least a minute and at most a day
export function durationProblem(text: string | null | undefined): DurationProblem | null {
    if (!text?.trim()) {
        return 'missing';
    }
    const minutes = parseDuration(text);
    if (minutes === null) {
        return 'format';
    }
    if (minutes < 1) {
        return 'missing';
    }
    return minutes > MAX_DURATION_MINUTES ? 'tooLong' : null;
}

// Minutes the way the user types them, to edit a logged duration: "12h30m", "3h", "45m"
export function toDurationInput(minutes: number | null | undefined): string {
    if (minutes == null) {
        return '';
    }
    const hours = Math.floor(minutes / MINUTES_PER_HOUR);
    const restMinutes = minutes % MINUTES_PER_HOUR;
    if (hours > 0 && restMinutes > 0) {
        return `${hours}h${restMinutes}m`;
    }
    return hours > 0 ? `${hours}h` : `${restMinutes}m`;
}
