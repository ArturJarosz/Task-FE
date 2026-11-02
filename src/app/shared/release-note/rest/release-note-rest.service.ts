import {catchError, Observable} from "rxjs";
import {ReleaseNote} from "../../../generated/models/release-note";
import {ReleaseNotesSeen} from "../../../generated/models/release-notes-seen";
import {UnseenReleaseNotes} from "../../../generated/models/unseen-release-notes";
import {AbstractRestService} from "../../rest/abstract-rest.service";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";

export abstract class ReleaseNoteRestService {
    abstract getReleaseNotes(): Observable<ReleaseNote[]>;

    abstract getUnseenReleaseNotes(): Observable<UnseenReleaseNotes>;

    abstract markReleaseNotesSeen(lastSeenId: number): Observable<void>;
}

@Injectable()
export class ReleaseNoteRestServiceImpl extends AbstractRestService implements ReleaseNoteRestService {
    private releaseNotesUrl: string = `${environment.baseUrl}/release-notes`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getReleaseNotes(): Observable<ReleaseNote[]> {
        return this.httpClient.get<ReleaseNote[]>(this.releaseNotesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    "Error loading what's new"))
            );
    }

    // No error toast: the user didn't ask for these notes, so a failure just means no popup this time
    getUnseenReleaseNotes(): Observable<UnseenReleaseNotes> {
        return this.httpClient.get<UnseenReleaseNotes>(`${this.releaseNotesUrl}/unseen`);
    }

    // No error toast: if saving fails, the same notes are shown again on the next visit
    markReleaseNotesSeen(lastSeenId: number): Observable<void> {
        const releaseNotesSeen: ReleaseNotesSeen = {lastSeenId};
        return this.httpClient.post<void>(`${this.releaseNotesUrl}/seen`, releaseNotesSeen);
    }
}
