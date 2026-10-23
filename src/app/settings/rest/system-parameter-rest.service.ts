import {catchError, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";
import {SystemParameter} from "../../generated/models/system-parameter";

export abstract class SystemParameterRestService {
    abstract getSystemParameters(): Observable<SystemParameter[]>;

    abstract updateSystemParameter(systemParameterId: number, systemParameter: SystemParameter): Observable<SystemParameter>;
}

@Injectable()
export class SystemParameterRestServiceImpl extends AbstractRestService implements SystemParameterRestService {
    private systemParameterUrl: string = `${environment.baseUrl}/system-parameters`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getSystemParameters(): Observable<SystemParameter[]> {
        return this.httpClient.get<SystemParameter[]>(this.systemParameterUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, `Error loading system parameters`))
            );
    }

    updateSystemParameter(systemParameterId: number, systemParameter: SystemParameter): Observable<SystemParameter> {
        return this.httpClient.put<SystemParameter>(`${this.systemParameterUrl}/${systemParameterId}`, systemParameter)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error updating system parameter with id ${systemParameterId}`))
            );
    }
}
