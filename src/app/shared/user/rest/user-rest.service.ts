import {catchError, Observable} from "rxjs";
import {User} from "../../../generated/models/user";
import {AbstractRestService} from "../../rest/abstract-rest.service";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {Injectable} from "@angular/core";

export abstract class UserRestService {
    abstract getCurrentUser(): Observable<User>;
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
}
