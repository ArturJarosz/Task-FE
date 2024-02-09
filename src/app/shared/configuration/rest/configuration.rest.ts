import {catchError, Observable} from "rxjs";
import {ApplicationConfiguration} from "../model/configuration";
import {AbstractRestService} from "../../rest/abstract-rest.service";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";

export abstract class ConfigurationRestService {
    abstract getConfiguration(): Observable<ApplicationConfiguration>;
}

@Injectable()
export class ConfigurationRestServiceImpl extends AbstractRestService implements ConfigurationRestService {
    private configurationUrl: string = `${environment.baseUrl}/configuration`;


    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getConfiguration(): Observable<ApplicationConfiguration> {
        console.log(`clients url: ${this.configurationUrl}`);
        return this.httpClient.get<ApplicationConfiguration>(this.configurationUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService))
            );
    }
}
