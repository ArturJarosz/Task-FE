import {Inject, Injectable, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {DOCUMENT} from "@angular/common";
import {Observable} from "rxjs";
import {User} from "@auth0/auth0-spa-js";
import {MessageService} from "primeng/api";
import {MessageSeverity} from "../shared";

export abstract class AuthorizationService {
    abstract login(): void;

    abstract logout(): void;

    abstract isAuthenticated(): Observable<boolean>;

    abstract getUser(): Observable<import("@auth0/auth0-spa-js").User | null | undefined>;

}

@Injectable()
export class AuthorizationServiceImpl implements AuthorizationService, OnInit {

    constructor(protected auth: AuthService, @Inject(DOCUMENT) private doc: Document,
                private messageService: MessageService) {
    }

    ngOnInit() {
        this.auth.error$.subscribe(error => {
            this.messageService.add({
                severity: MessageSeverity.ERROR,
                summary: "Authentication failed",
                detail: error.message
            })
        })
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
