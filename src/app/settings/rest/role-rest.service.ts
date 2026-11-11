import {catchError, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {MessageService} from "primeng/api";
import {Role} from "../../generated/models/role";
import {ResourcePermissions} from "../../generated/models/resource-permissions";
import {AbstractRestService} from "../../shared/rest/abstract-rest.service";
import {environment} from "../../../environments/environment";

export abstract class RoleRestService {
    abstract getRoles(): Observable<Role[]>;

    abstract createRole(role: Role): Observable<Role>;

    abstract updateRole(roleId: number, role: Role): Observable<Role>;

    abstract deleteRole(roleId: number): Observable<void>;

    abstract getAvailablePermissions(): Observable<ResourcePermissions[]>;
}

@Injectable()
export class RoleRestServiceImpl extends AbstractRestService implements RoleRestService {
    private readonly rolesUrl = `${environment.baseUrl}/roles`;
    private readonly permissionsUrl = `${environment.baseUrl}/permissions`;

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        super();
    }

    getRoles(): Observable<Role[]> {
        return this.httpClient.get<Role[]>(this.rolesUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, "Error loading roles"))
            );
    }

    createRole(role: Role): Observable<Role> {
        return this.httpClient.post<Role>(this.rolesUrl, role)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, "Error creating role"))
            );
    }

    updateRole(roleId: number, role: Role): Observable<Role> {
        return this.httpClient.put<Role>(`${this.rolesUrl}/${roleId}`, role)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error saving role with id ${roleId}`))
            );
    }

    deleteRole(roleId: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.rolesUrl}/${roleId}`)
            .pipe(
                catchError(error => this.handleError(error, this.messageService,
                    `Error deleting role with id ${roleId}`))
            );
    }

    getAvailablePermissions(): Observable<ResourcePermissions[]> {
        return this.httpClient.get<ResourcePermissions[]>(this.permissionsUrl)
            .pipe(
                catchError(error => this.handleError(error, this.messageService, "Error loading permissions"))
            );
    }
}
