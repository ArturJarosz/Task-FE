import {catchError, Observable} from "rxjs";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";
import {CalendarEvent} from "../../generated/models/calendar-event";

export abstract class CalendarRestService {
    abstract getCalendarEvents(startDate: string, endDate: string): Observable<CalendarEvent[]>;

    abstract createCalendarEvent(event: CalendarEvent): Observable<CalendarEvent>;

    abstract getCalendarEvent(eventId: number): Observable<CalendarEvent>;

    abstract updateCalendarEvent(eventId: number, event: CalendarEvent): Observable<CalendarEvent>;

    abstract deleteCalendarEvent(eventId: number): Observable<void>;
}

@Injectable()
export class CalendarRestServiceImpl extends AbstractRestService implements CalendarRestService {
    private calendarEventsUrl: string = `${environment.baseUrl}/calendars/events`

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getCalendarEvents(startDate: string, endDate: string): Observable<CalendarEvent[]> {
        const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
        return this.httpClient.get<CalendarEvent[]>(this.calendarEventsUrl, {params})
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading calendar events`))
            );
    }

    createCalendarEvent(event: CalendarEvent): Observable<CalendarEvent> {
        return this.httpClient.post<CalendarEvent>(this.calendarEventsUrl, event)
            .pipe(
                catchError(
                    error => this.handleError(error, this.messageService, `Error creating new calendar event`))
            );
    }

    getCalendarEvent(eventId: number): Observable<CalendarEvent> {
        return this.httpClient.get<CalendarEvent>(`${this.calendarEventsUrl}/${eventId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading calendar event with id: ${eventId}`))
            );
    }

    updateCalendarEvent(eventId: number, event: CalendarEvent): Observable<CalendarEvent> {
        return this.httpClient.put<CalendarEvent>(`${this.calendarEventsUrl}/${eventId}`, event)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error updating calendar event with id: ${eventId}`))
            );
    }

    deleteCalendarEvent(eventId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.calendarEventsUrl}/${eventId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error removing calendar event with id: ${eventId}`))
            );
    }
}
