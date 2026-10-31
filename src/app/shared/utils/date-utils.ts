import {format} from "date-fns-tz";
import {addDays, startOfDay} from "date-fns";
import {ChangeDetectorRef, DestroyRef, inject, NgZone} from "@angular/core";

// Runs `update` once a new day has started, while the component lives, then marks it for check, so a view that shows
// today (a Today line, the current period) stays right in a tab left open. A timer fires just after midnight, but
// timers don't run while the computer sleeps, so the day is also checked whenever the tab is shown again. Call it in
// a constructor (it needs the component's injection context).
export function updateAtMidnight(update: () => void): void {
    const changeDetector = inject(ChangeDetectorRef);
    const zone = inject(NgZone);
    let day = startOfDay(new Date()).getTime();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
        clearTimeout(timer);
        const today = startOfDay(new Date());
        if (today.getTime() !== day) {
            day = today.getTime();
            zone.run(() => {
                update();
                changeDetector.markForCheck();
            });
        }
        // Outside Angular: a timer pending for a day would keep the app from ever being stable (whenStable, hydration)
        timer = zone.runOutsideAngular(() => setTimeout(check, addDays(today, 1).getTime() - Date.now() + 1000));
    };
    const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            check();
        }
    };
    check();
    document.addEventListener('visibilitychange', onVisibilityChange);
    inject(DestroyRef).onDestroy(() => {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVisibilityChange);
    });
}

export function toTimeZoneString(date?: Date): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    return format(date, "yyyy-MM-dd", {timeZone: 'Europe/Warsaw'});
}

export function toLocalDateTimeString(date?: Date): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    return format(date, "yyyy-MM-dd'T'HH:mm:ss", {timeZone: 'Europe/Warsaw'});
}

export function toDateIfExists(maybeDate?: string) {
    return maybeDate ? new Date(maybeDate) : undefined;
}
