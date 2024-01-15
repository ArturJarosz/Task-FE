import {catchError, Observable} from "rxjs";
import {Architect} from "../model/architect";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";

export abstract class ArchitectRestService {
    abstract getArchitects(): Observable<Architect[]>;

    abstract getArchitect(architectId: number): Observable<Architect>;
}

@Injectable()
export class ArchitectRestServiceImpl extends AbstractRestService implements ArchitectRestService {
    private architectUrl: string = `${environment.baseUrl}/architects`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getArchitects(): Observable<Architect[]> {
        return this.httpClient.get<Architect[]>(this.architectUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

    getArchitect(architectId: number): Observable<Architect> {
        return this.httpClient.get<Architect>(`${this.architectUrl}/${architectId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }

}
