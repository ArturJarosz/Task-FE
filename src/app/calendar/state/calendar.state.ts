import {AppState} from "../../state/app.store";
import {CalendarEvent} from "../../generated/models/calendar-event";
import {DateRange, EventConnection, GoogleSyncIssue} from "../model/calendar.model";
import {patchState, signalStore, withComputed, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {catchError, EMPTY, of, pipe, switchMap, tap} from "rxjs";
import {CalendarRestService} from "../rest/calendar-rest.service";
import {computed, inject} from "@angular/core";
import {MessageSeverity} from "../../shared/message";
import {MessageService} from "primeng/api";
import {toTimeZoneString} from "../../shared/utils/date-utils";
import {GoogleCalendarConnection} from "../../generated/models/google-calendar-connection";
import {GoogleCalendarConnectionStatus} from "../../generated/models/google-calendar-connection-status";
import {GoogleCalendarConnectionRestService} from "../../settings/rest/google-calendar-connection-rest.service";

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
    // Whether events reach Google Calendar. Checked when a page with events opens and the last check is older than
    // GOOGLE_CONNECTION_MAX_AGE_MS or when a sync tag asks for it, and taken from every check in Settings
    googleConnection: GoogleCalendarConnection | null;
    // When the last check ended (Date.now()), failed or not
    googleConnectionCheckedAt: number | null;
    googleConnectionChecking: boolean;
    googleConnectionLoadFailed: boolean;
}

// Long enough that moving between pages doesn't make the server call Google each time, short enough that a passing
// outage or a sync that broke later shows up without a reload
export const GOOGLE_CONNECTION_MAX_AGE_MS = 5 * 60 * 1000;

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
    googleConnection: null,
    googleConnectionCheckedAt: null,
    googleConnectionChecking: false,
    googleConnectionLoadFailed: false,
}

export const CalendarStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withComputed(({googleConnection, googleConnectionLoadFailed}) => ({
        // Nothing before the first check ends or when sync works; a recheck keeps the last answer until the new one
        googleSyncIssue: computed<GoogleSyncIssue | null>(() => {
            if (googleConnectionLoadFailed()) {
                return 'UNKNOWN';
            }
            const status = googleConnection()?.status;
            return status && status !== GoogleCalendarConnectionStatus.CONNECTED ? status : null;
        }),
    })),
    withMethods((store, connectionRestService = inject(GoogleCalendarConnectionRestService)) => {
        // Checks from the server and from Settings go through one stream, so a newer one always replaces a running
        // check and a late answer can't bring back an issue Settings has just seen fixed
        const updateConnection = rxMethod<GoogleCalendarConnection | 'check'>(
            pipe(
                switchMap(update => {
                    if (update !== 'check') {
                        patchState(store, {
                            googleConnection: update,
                            googleConnectionCheckedAt: Date.now(),
                            googleConnectionChecking: false,
                            googleConnectionLoadFailed: false
                        });
                        return EMPTY;
                    }
                    patchState(store, {googleConnectionChecking: true});
                    return connectionRestService.getConnectionStatus()
                        .pipe(
                            tap(connection => patchState(store, {
                                googleConnection: connection,
                                googleConnectionCheckedAt: Date.now(),
                                googleConnectionChecking: false,
                                googleConnectionLoadFailed: false
                            })),
                            // The REST service already shows the error toast; keep the stream alive for the next check
                            catchError(() => {
                                patchState(store, {
                                    googleConnection: null,
                                    googleConnectionCheckedAt: Date.now(),
                                    googleConnectionChecking: false,
                                    googleConnectionLoadFailed: true
                                });
                                return EMPTY;
                            })
                        );
                })
            )
        );
        return {
            // A sync tag's "check again"
            checkGoogleConnection(): void {
                updateConnection('check');
            },
            // A check made in Settings, so the event pages don't ask Google again
            setGoogleConnection(connection: GoogleCalendarConnection): void {
                updateConnection(connection);
            },
            // Every page with events calls it when it opens; the server is asked only when the last check is too old,
            // and never while a check runs
            loadGoogleConnection(): void {
                const checkedAt = store.googleConnectionCheckedAt();
                const stale = checkedAt === null || Date.now() - checkedAt > GOOGLE_CONNECTION_MAX_AGE_MS;
                if (!store.googleConnectionChecking() && stale) {
                    updateConnection('check');
                }
            },
        };
    }),
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
