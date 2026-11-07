import {AppState} from "../../state/app.store";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {DateRange, EventConnection} from "../model/calendar.model";
import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {CalendarRestService} from "../rest/calendar-rest.service";
import {inject} from "@angular/core";
import {MessageSeverity} from "../../shared/message";
import {MessageService} from "primeng/api";
import {toTimeZoneString} from "../../shared/utils/date-utils";

export interface CalendarState extends AppState {
    events: CalendarEvent[];
    visibleRange: DateRange | null;
    eventsNeedRefresh: boolean;
    upcomingEvents: CalendarEvent[];
    upcomingEventsNeedRefresh: boolean;
    selectedEvent: CalendarEvent | null;
    connectedEvents: CalendarEvent[];
    connectedEventsConnection: EventConnection | null;
    connectedEventsLoading: boolean;
    connectedEventsNeedRefresh: boolean;
    connectedEventsLoadFailed: boolean;
}

export const initialState: CalendarState = {
    events: [],
    visibleRange: null,
    eventsNeedRefresh: true,
    upcomingEvents: [],
    upcomingEventsNeedRefresh: true,
    selectedEvent: null,
    connectedEvents: [],
    connectedEventsConnection: null,
    connectedEventsLoading: false,
    connectedEventsNeedRefresh: false,
    connectedEventsLoadFailed: false,
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
                                    })),
                                    catchError(() => EMPTY)
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
                            return calendarRestService.getCalendarEvents(toTimeZoneString(today)!)
                                .pipe(
                                    tap(events => patchState(store, {
                                        upcomingEvents: [...events].sort((a, b) =>
                                            (a.startDateTime ?? '').localeCompare(b.startDateTime ?? '')),
                                        upcomingEventsNeedRefresh: false
                                    })),
                                    catchError(() => EMPTY)
                                )
                        }
                        return of({});
                    })
                )
            ),
            loadConnectedEvents: rxMethod<EventConnection>(
                pipe(
                    tap(connection => {
                        const previous = store.connectedEventsConnection();
                        const sameList = previous?.clientId === connection.clientId
                            && previous?.projectId === connection.projectId;
                        // Another client's or project's events must not show while these load
                        patchState(store, {
                            connectedEvents: sameList ? store.connectedEvents() : [],
                            connectedEventsConnection: connection,
                            connectedEventsLoading: !sameList || store.connectedEventsLoadFailed(),
                            connectedEventsNeedRefresh: false,
                            connectedEventsLoadFailed: false,
                        });
                    }),
                    switchMap(connection => calendarRestService.getConnectedCalendarEvents(connection)
                        .pipe(
                            tap(events => patchState(store, {connectedEvents: events, connectedEventsLoading: false})),
                            // The REST service already shows the error toast; keep the stream alive for the next load
                            catchError(() => {
                                patchState(store, {connectedEventsLoading: false, connectedEventsLoadFailed: true});
                                return EMPTY;
                            })
                        ))
                )
            ),
            createCalendarEvent: rxMethod<{ event: CalendarEvent }>(
                pipe(
                    switchMap(({event}) => {
                        return calendarRestService.createCalendarEvent(event)
                            .pipe(
                                tap(event => {
                                    patchState(store, {
                                        eventsNeedRefresh: true,
                                        upcomingEventsNeedRefresh: true,
                                        connectedEventsNeedRefresh: true
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `New event created`,
                                        detail: `New event '${event.name}' was created.`,
                                    });
                                }),
                                catchError(() => EMPTY)
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
                                        connectedEventsNeedRefresh: true,
                                        selectedEvent: null
                                    });
                                    messageService.add({
                                        severity: MessageSeverity.INFO,
                                        summary: `Event updated.`,
                                        detail: `Event '${event.name}' was updated.`,
                                    });
                                }),
                                catchError(() => EMPTY)
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
                                        connectedEventsNeedRefresh: true,
                                        selectedEvent: null,
                                    });
                                }),
                                catchError(() => EMPTY)
                            )
                    })
                )
            ),
        }))
)
