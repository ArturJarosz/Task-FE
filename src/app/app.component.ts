import {Component, Inject, inject, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ConfigurationStore} from "./shared/configuration/state";
import {DOCUMENT} from "@angular/common";
import {AuthorizationService} from "./security/authorization.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'Task-FE';
    items: MenuItem[] = [];

    readonly configurationStore = inject(ConfigurationStore);

    constructor(protected authorizationService: AuthorizationService, @Inject(DOCUMENT) private doc: Document) {
    }

    //TODO TA-313 Make menu code dependent, not hardcoded in HTML
    ngOnInit(): void {
        this.authorizationService.isAuthenticated()
            .subscribe(isAuthenticated => {
                if (isAuthenticated) {
                    this.configurationStore.loadConfiguration({});
                }
            })

        this.items = [
            {
                label: "Main",
                routerLink: "/home"
            },
            {
                label: "Clients",
                routerLink: "/clients"
            },
            {
                label: "Architects",
                routerLink: "/architects"
            },
            {
                label: "Projects",
                routerLink: "/projects"
            },
            {
                label: "Contractors",
                routerLink: "/contractors"
            }
        ]
    }

    login(): void {
        this.authorizationService.login();
    }

    logout(): void {
        this.authorizationService.logout();
    }
}
