import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {GoogleCalendarConnection} from "../../generated/models/google-calendar-connection";

export abstract class GoogleCalendarConnectionRestService {
    abstract getConnectionStatus(): Observable<GoogleCalendarConnection>;
}

@Injectable()
export class GoogleCalendarConnectionRestServiceImpl extends AbstractRestService implements GoogleCalendarConnectionRestService {
    private connectionStatusUrl: string = `${environment.baseUrl}/calendars/connection-status`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getConnectionStatus(): Observable<GoogleCalendarConnection> {
        return this.httpClient.get<GoogleCalendarConnection>(this.connectionStatusUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error checking the Google Calendar connection`))
            );
    }
}
