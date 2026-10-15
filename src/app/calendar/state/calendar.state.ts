import {AppState} from "../../state/app.store";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {DateRange} from "../model/calendar.model";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, switchMap, tap} from "rxjs";
import {CalendarRestService} from "../rest/calendar-rest.service";
import {inject} from "@angular/core";
import {MessageSeverity} from "../../shared";
import {MessageService} from "primeng/api";
import {toTimeZoneString} from "../../shared/utils/date-utils";

const UPCOMING_EVENTS_RANGE_DAYS = 90;

export interface CalendarState extends AppState {
    events: CalendarEvent[];
    visibleRange: DateRange | null;
    eventsNeedRefresh: boolean;
    upcomingEvents: CalendarEvent[];
    upcomingEventsNeedRefresh: boolean;
    selectedEvent: CalendarEvent | null;
}

export const initialState: CalendarState = {
    events: [],
    visibleRange: null,
    eventsNeedRefresh: true,
    upcomingEvents: [],
    upcomingEventsNeedRefresh: true,
    selectedEvent: null,
}

export const CalendarStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, calendarRestService = inject(CalendarRestService), messageService = inject(MessageService)) => ({
            setVisibleRange(range: DateRange) {
                const currentRange = store.visibleRange();
                if (currentRange?.startDate !== range.startDate || currentRange?.endDate !== range.endDate) {
                    patchState(store, {visibleRange: range, eventsNeedRefresh: true});
                }
            },
            setSelectedEvent(event: CalendarEvent | null) {
                patchState(store, {selectedEvent: event});
            },
            setEventsNeedRefresh() {
                patchState(store, {eventsNeedRefresh: true});
            },
            setUpcomingEventsNeedRefresh() {
                patchState(store, {upcomingEventsNeedRefresh: true});
            },
            loadEvents: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        const range = store.visibleRange();
                        if (store.eventsNeedRefresh() && range) {
                            return calendarRestService.getCalendarEvents(range.startDate, range.endDate)
                                .pipe(
                                    tap(events => patchState(store, {
                                        events: events,
                                        eventsNeedRefresh: false
                                    }))
                                )
                        }
                        return of({});
                    })
                )
            ),
            loadUpcomingEvents: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        if (store.upcomingEventsNeedRefresh()) {
                            const today = new Date();
                            const rangeEnd = new Date();
                            rangeEnd.setDate(rangeEnd.getDate() + UPCOMING_EVENTS_RANGE_DAYS);
                            return calendarRestService.getCalendarEvents(toTimeZoneString(today)!, toTimeZoneString(rangeEnd)!)
                                .pipe(
                                    tap(events => patchState(store, {
                                        upcomingEvents: [...events].sort((a, b) =>
                                            (a.startDateTime ?? '').localeCompare(b.startDateTime ?? '')),
                                        upcomingEventsNeedRefresh: false
                                    }))
                                )
                        }
                        return of({});
                    })
                )
            ),
            createCalendarEvent: rxMethod<{ event: CalendarEvent }>(
                pipe(
                    switchMap(({event}) => {
                        return calendarRestService.createCalendarEvent(event)
                            .pipe(
                                tap(event => {
                                    patchState(store, {eventsNeedRefresh: true, upcomingEventsNeedRefresh: true});
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `New event created`,
                                        detail: `New event '${event.name}' was created.`,
                                    });
                                })
                            )
                    })
                )
            ),
            updateCalendarEvent: rxMethod<{ event: CalendarEvent }>(
                pipe(
                    switchMap(({event}) => {
                        return calendarRestService.updateCalendarEvent(store.selectedEvent()!.id!, event)
                            .pipe(
                                tap(event => {
                                    patchState(store, {
                                        eventsNeedRefresh: true,
                                        upcomingEventsNeedRefresh: true,
                                        selectedEvent: null
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Event updated.`,
                                        detail: `Event '${event.name}' was updated.`,
                                    });
                                })
                            )
                    })
                )
            ),
            deleteCalendarEvent: rxMethod<{ eventId: number }>(
                pipe(
                    switchMap(({eventId}) => {
                        return calendarRestService.deleteCalendarEvent(eventId)
                            .pipe(
                                tap(() => {
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Event removed.`,
                                        detail: `Event with id ${eventId} was removed.`,
                                    });
                                    patchState(store, {
                                        eventsNeedRefresh: true,
                                        upcomingEventsNeedRefresh: true,
                                        selectedEvent: null,
                                    });
                                })
                            )
                    })
                )
            ),
        }))
)
