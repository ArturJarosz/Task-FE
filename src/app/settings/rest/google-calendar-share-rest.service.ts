import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {CalendarShare} from "../../generated/models/calendar-share";

export abstract class GoogleCalendarShareRestService {
    abstract getShares(): Observable<CalendarShare[]>;

    abstract addShare(share: CalendarShare): Observable<CalendarShare>;

    abstract removeShare(email: string): Observable<void>;
}

@Injectable()
export class GoogleCalendarShareRestServiceImpl extends AbstractRestService implements GoogleCalendarShareRestService {
    private sharesUrl: string = `${environment.baseUrl}/calendars/shares`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getShares(): Observable<CalendarShare[]> {
        return this.httpClient.get<CalendarShare[]>(this.sharesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading people with access to the calendar`))
            );
    }

    addShare(share: CalendarShare): Observable<CalendarShare> {
        return this.httpClient.post<CalendarShare>(this.sharesUrl, share)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error sharing the calendar`))
            );
    }

    removeShare(email: string): Observable<void> {
        return this.httpClient.delete<void>(this.sharesUrl, {params: {email: email}})
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error revoking access`))
            );
    }
}
