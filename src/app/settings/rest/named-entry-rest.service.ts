import {catchError, Observable} from "rxjs";
import {inject} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";

// What every configurable list that is only a name (project types, cost categories...) returns
export interface NamedEntryDto {
    id?: number;
    name?: string;
}

export abstract class NamedEntryRestService<T extends NamedEntryDto> {
    abstract getEntries(): Observable<T[]>;

    abstract createEntry(entry: T): Observable<T>;

    abstract updateEntry(entryId: number, entry: T): Observable<T>;

    abstract deleteEntry(entryId: number): Observable<void>;
}

/**
 * CRUD over /{path} of one list of named entries; singular and plural ("stage type", "stage types") word the error
 * toasts.
 */
export abstract class NamedEntryRestServiceImpl<T extends NamedEntryDto> extends AbstractRestService
    implements NamedEntryRestService<T> {
    private readonly httpClient = inject(HttpClient);
    private readonly messageService = inject(MessageService);
    private readonly entriesUrl: string;

    protected constructor(path: string, private readonly singular: string, private readonly plural: string) {
        super();
        this.entriesUrl = `${environment.baseUrl}/${path}`;
    }

    getEntries(): Observable<T[]> {
        return this.httpClient.get<T[]>(this.entriesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading ${this.plural}`))
            );
    }

    createEntry(entry: T): Observable<T> {
        return this.httpClient.post<T>(this.entriesUrl, entry)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error creating ${this.singular}`))
            );
    }

    updateEntry(entryId: number, entry: T): Observable<T> {
        return this.httpClient.put<T>(`${this.entriesUrl}/${entryId}`, entry)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error renaming ${this.singular} with id ${entryId}`))
            );
    }

    deleteEntry(entryId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.entriesUrl}/${entryId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting ${this.singular} with id ${entryId}`))
            );
    }
}
