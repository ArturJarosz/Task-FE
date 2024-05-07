import {format} from "date-fns-tz";

export function toTimeZoneString(date?: Date): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    return format(date, "yyyy-MM-dd", {timeZone: 'Europe/Warsaw'});
}

export function toDateIfExists(maybeDate?: string) {
    return maybeDate ? new Date(maybeDate) : undefined;
}
