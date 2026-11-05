import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {TimeEntry} from "../../generated/models/time-entry";

export abstract class TimeEntryRestService {
    abstract getTimeEntries(projectId: number, stageId: number, taskId: number): Observable<TimeEntry[]>;

    abstract createTimeEntry(projectId: number, stageId: number, taskId: number, timeEntry: TimeEntry): Observable<TimeEntry>;

    abstract updateTimeEntry(projectId: number, stageId: number, taskId: number, timeEntryId: number,
                             timeEntry: TimeEntry): Observable<TimeEntry>;

    abstract deleteTimeEntry(projectId: number, stageId: number, taskId: number, timeEntryId: number): Observable<void>;
}

@Injectable()
export class TimeEntryRestServiceImpl extends AbstractRestService implements TimeEntryRestService {
    private projectsUrl: string = `${environment.baseUrl}/projects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getTimeEntries(projectId: number, stageId: number, taskId: number): Observable<TimeEntry[]> {
        return this.httpClient.get<TimeEntry[]>(this.timeEntriesUrl(projectId, stageId, taskId))
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error loading time entries of task with id ${taskId}`))
            );
    }

    createTimeEntry(projectId: number, stageId: number, taskId: number, timeEntry: TimeEntry): Observable<TimeEntry> {
        return this.httpClient.post<TimeEntry>(this.timeEntriesUrl(projectId, stageId, taskId), timeEntry)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error logging time`))
            );
    }

    updateTimeEntry(projectId: number, stageId: number, taskId: number, timeEntryId: number,
                    timeEntry: TimeEntry): Observable<TimeEntry> {
        return this.httpClient.put<TimeEntry>(`${this.timeEntriesUrl(projectId, stageId, taskId)}/${timeEntryId}`,
            timeEntry)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error updating time entry with id ${timeEntryId}`))
            );
    }

    deleteTimeEntry(projectId: number, stageId: number, taskId: number, timeEntryId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.timeEntriesUrl(projectId, stageId, taskId)}/${timeEntryId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting time entry with id ${timeEntryId}`))
            );
    }

    private timeEntriesUrl(projectId: number, stageId: number, taskId: number): string {
        return `${this.projectsUrl}/${projectId}/stages/${stageId}/tasks/${taskId}/time-entries`;
    }
}
