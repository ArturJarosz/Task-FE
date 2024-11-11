import {Component, inject, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ConfigurationStore} from "./shared/configuration/state";
import {AuthorizationService} from "./security/authorization.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {BreadcrumbService} from "./shared/breadcrumb/breadcrumb.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    title = 'Task-FE';

    breadcrumbItems: MenuItem[] = [];

    readonly configurationStore = inject(ConfigurationStore);

    constructor(protected authorizationService: AuthorizationService, private router: Router,
                private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService) {
    }

    ngOnInit(): void {
        this.authorizationService.isAuthenticated()
            .subscribe(isAuthenticated => {
                if (isAuthenticated) {
                    this.configurationStore.loadConfiguration({});
                }
            })

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.breadcrumbItems = this.breadcrumbService.createBreadcrumbs(this.activatedRoute.root);
            });
    }

    login(): void {
        this.authorizationService.login();
    }

    logout(): void {
        this.authorizationService.logout();
    }
}
