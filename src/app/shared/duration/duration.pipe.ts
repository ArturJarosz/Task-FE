import {formatNumber} from "@angular/common";
import {inject, LOCALE_ID, Pipe, PipeTransform} from "@angular/core";

const MINUTES_PER_HOUR = 60;

export type DurationFormat = 'long' | 'short';

// Minutes as hours and minutes: "12 h 30 min", "45 min", "3 h", and 0 as "0 h". Empty for a missing value.
// The short format, for a figure in a narrow column, is written the way time is typed: "12h 30m", "45m", "3h".
export function formatDuration(minutes: number | null | undefined, locale: string,
                               format: DurationFormat = 'long'): string {
    if (minutes == null || !Number.isFinite(minutes)) {
        return '';
    }
    const wholeMinutes = Math.round(minutes);
    const hours = Math.floor(wholeMinutes / MINUTES_PER_HOUR);
    const restMinutes = wholeMinutes % MINUTES_PER_HOUR;
    const parts: string[] = [];
    const [hoursUnit, minutesUnit] = format === 'short' ? ['h', 'm'] : [' h', ' min'];
    if (hours > 0 || restMinutes === 0) {
        parts.push(`${formatNumber(hours, locale, '1.0-0')}${hoursUnit}`);
    }
    if (restMinutes > 0) {
        parts.push(`${restMinutes}${minutesUnit}`);
    }
    return parts.join(' ');
}

// {{ task.timeSpentMinutes | duration }}: time spent, logged in minutes, as hours and minutes;
// {{ minutes | duration:'short' }} for a narrow column
@Pipe({
    name: 'duration',
    standalone: true
})
export class DurationPipe implements PipeTransform {
    private readonly locale = inject(LOCALE_ID);

    transform(minutes: number | null | undefined, format: DurationFormat = 'long'): string {
        return formatDuration(minutes, this.locale, format);
    }
}
