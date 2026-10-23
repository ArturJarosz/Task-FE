import {catchError, Observable} from "rxjs";
import {User} from "../../../generated/models/user";
import {UserConfiguration} from "../../../generated/models/user-configuration";
import {UserConfigurationName} from "../../../generated/models/user-configuration-name";
import {AbstractRestService} from "../../rest/abstract-rest.service";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";

export abstract class UserRestService {
    abstract getCurrentUser(): Observable<User>;

    abstract getCurrentUserConfigurations(): Observable<UserConfiguration[]>;

    abstract updateCurrentUserConfiguration(name: UserConfigurationName, value: string): Observable<UserConfiguration>;
}

@Injectable()
export class UserRestServiceImpl extends AbstractRestService implements UserRestService {
    private userUrl: string = `${environment.baseUrl}/users/current`;


    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getCurrentUser(): Observable<User> {
        return this.httpClient.get<User>(this.userUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    "Error loading current user"))
            );
    }

    getCurrentUserConfigurations(): Observable<UserConfiguration[]> {
        return this.httpClient.get<UserConfiguration[]>(`${this.userUrl}/configurations`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    "Error loading your settings"))
            );
    }

    updateCurrentUserConfiguration(name: UserConfigurationName, value: string): Observable<UserConfiguration> {
        return this.httpClient.put<UserConfiguration>(`${this.userUrl}/configurations/${name}`, {name, value})
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    "Error saving your settings"))
            );
    }
}
