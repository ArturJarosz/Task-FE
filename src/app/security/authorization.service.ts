import {Inject, Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "@auth0/auth0-angular";
import {DOCUMENT} from "@angular/common";
import {Observable} from "rxjs";
import {User} from "@auth0/auth0-spa-js";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../shared";
import {isSessionExpiredError} from "./session-expiry";

export abstract class AuthorizationService {
    abstract login(): void;

    abstract logout(): void;

    abstract isAuthenticated(): Observable<boolean>;

    abstract getUser(): Observable<import("@auth0/auth0-spa-js").User | null | undefined>;

}

@Injectable()
export class AuthorizationServiceImpl implements AuthorizationService {
    private sessionExpired = false;

    // Services get no ngOnInit, so the auth errors are watched from the constructor
    constructor(protected auth: AuthService, @Inject(DOCUMENT) private doc: Document,
                private messageService: MessageService, private router: Router) {
        this.auth.error$.subscribe(error => this.handleAuthError(error));
    }

    private handleAuthError(error: Error): void {
        if (isSessionExpiredError(error)) {
            this.onSessionExpired();
            return;
        }
        this.messageService.add({
            severity: MessageSeverity.ERROR,
            summary: "Authentication failed",
            detail: error.message
        });
    }

    // Several requests can fail at once; drop the dead tokens locally (no trip to Auth0)
    // and let the not-logged-in page explain and redirect to login
    private onSessionExpired(): void {
        if (this.sessionExpired) {
            return;
        }
        this.sessionExpired = true;
        this.auth.logout({openUrl: false}).subscribe(() =>
            this.router.navigate(['/not-logged-in'], {queryParams: {reason: 'expired'}}));
    }

    login(): void {
        this.auth.loginWithRedirect();
    }

    logout(): void {
        this.auth.logout({
            logoutParams: {
                returnTo: `${this.doc.location.origin}/logout`
            }
        });
    }

    isAuthenticated(): Observable<boolean> {
        return this.auth.isAuthenticated$;
    }

    getUser(): Observable<User | null | undefined> {
        return this.auth.user$;
    }
}
