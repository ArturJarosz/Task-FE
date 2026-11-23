import {catchError, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {Notifications} from "../../generated/models/notifications";
import {NotificationCount} from "../../generated/models/notification-count";
import {NotificationRead} from "../../generated/models/notification-read";
import {NotificationSetting} from "../../generated/models/notification-setting";
import {NotificationType} from "../../generated/models/notification-type";

export interface NotificationQuery {
    unread: boolean;
    type: NotificationType | null;
    page: number;
    size: number;
}

export abstract class NotificationRestService {
    abstract getNotifications(query: NotificationQuery): Observable<Notifications>;

    abstract getNotificationCount(): Observable<NotificationCount>;

    abstract updateNotificationRead(notificationId: number, read: boolean): Observable<void>;

    abstract markAllNotificationsRead(): Observable<void>;

    abstract getNotificationSettings(): Observable<NotificationSetting[]>;

    abstract updateNotificationSettings(settings: NotificationSetting[]): Observable<NotificationSetting[]>;
}

@Injectable()
export class NotificationRestServiceImpl extends AbstractRestService implements NotificationRestService {
    private notificationsUrl: string = `${environment.baseUrl}/notifications`;
    private settingsUrl: string = `${environment.baseUrl}/notification-settings`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getNotifications(query: NotificationQuery): Observable<Notifications> {
        let params = new HttpParams().set('unread', query.unread).set('page', query.page).set('size', query.size);
        if (query.type) {
            params = params.set('type', query.type);
        }
        return this.httpClient.get<Notifications>(this.notificationsUrl, {params})
            .pipe(
                catchError(error => this.handleError(error, this.messageService, 'Error loading notifications'))
            );
    }

    // No error toast: the count reloads in the background every few minutes, so an outage would toast each time
    getNotificationCount(): Observable<NotificationCount> {
        return this.httpClient.get<NotificationCount>(`${this.notificationsUrl}/count`);
    }

    updateNotificationRead(notificationId: number, read: boolean): Observable<void> {
        const notificationRead: NotificationRead = {read};
        return this.httpClient.patch<void>(`${this.notificationsUrl}/${notificationId}`, notificationRead)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, 'Error updating notification'))
            );
    }

    markAllNotificationsRead(): Observable<void> {
        return this.httpClient.post<void>(`${this.notificationsUrl}/read-all`, null)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, 'Error updating notifications'))
            );
    }

    getNotificationSettings(): Observable<NotificationSetting[]> {
        return this.httpClient.get<NotificationSetting[]>(this.settingsUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    'Error loading notification settings'))
            );
    }

    updateNotificationSettings(settings: NotificationSetting[]): Observable<NotificationSetting[]> {
        return this.httpClient.put<NotificationSetting[]>(this.settingsUrl, settings)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    'Error saving notification settings'))
            );
    }
}
