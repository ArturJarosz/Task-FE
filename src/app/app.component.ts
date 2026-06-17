import {Component, effect, inject, OnInit, ViewChild} from '@angular/core';
import {MenuItem} from "primeng/api";
import {ConfigurationStore} from "./shared/configuration/state";
import {UserStore} from "./shared/user/state";
import {AuthorizationService} from "./security/authorization.service";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {filter} from "rxjs";
import {BreadcrumbService} from "./shared/breadcrumb/breadcrumb.service";
import {Menu} from "primeng/menu";
import {ToastModule} from "primeng/toast";
import {AvatarModule} from "primeng/avatar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {RippleModule} from "primeng/ripple";
import {StyleClassModule} from "primeng/styleclass";
import {TooltipModule} from "primeng/tooltip";
import {NgIf, NgClass, AsyncPipe} from "@angular/common";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    standalone: true,
    imports: [ToastModule, AvatarModule, Menu, BreadcrumbModule, RippleModule, StyleClassModule, TooltipModule, NgIf, NgClass, AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet]
})
export class AppComponent implements OnInit {
    title = 'Task-FE';

    sidebarCollapsed = false;

    breadcrumbItems: MenuItem[] = [];
    userMenuItems: MenuItem[] = [];

    @ViewChild('userMenu') userMenu!: Menu;

    readonly configurationStore = inject(ConfigurationStore);
    readonly userStore = inject(UserStore);

    constructor(protected authorizationService: AuthorizationService, private router: Router,
                private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService) {
        effect(() => {
            const user = this.userStore.currentUser();
            this.userMenuItems = [
                {label: user?.username || '', disabled: true, styleClass: 'font-bold'},
                {separator: true},
                {label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout()}
            ];
        });
    }

    ngOnInit(): void {
        this.authorizationService.isAuthenticated()
            .subscribe(isAuthenticated => {
                if (isAuthenticated) {
                    this.configurationStore.loadConfiguration({});
                    this.userStore.loadCurrentUser({});
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

    getUserInitial(): string {
        const user = this.userStore.currentUser();
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return '?';
    }

    toggleUserMenu(event: Event): void {
        this.userMenu.toggle(event);
    }

    alignUserMenuRight(): void {
        requestAnimationFrame(() => {
            const container = this.userMenu.container;
            const target = this.userMenu.target as HTMLElement;
            if (container && target) {
                const targetRect = target.getBoundingClientRect();
                container.style.left = (targetRect.right + window.scrollX - container.offsetWidth) + 'px';
            }
        });
    }

    toggleSidebar(): void {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }
}
