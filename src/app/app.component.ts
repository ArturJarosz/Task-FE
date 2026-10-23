import {Component, computed, inject, OnInit, ViewChild} from '@angular/core';
import {toSignal} from "@angular/core/rxjs-interop";
import {MenuItem} from "primeng/api";
import {ConfigurationStore} from "./shared/configuration/state";
import {UserStore} from "./shared/user/state";
import {SystemParameterStore} from "./settings/state";
import {AuthorizationService} from "./security/authorization.service";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {filter} from "rxjs";
import {BreadcrumbService} from "./shared/breadcrumb/breadcrumb.service";
import {Menu} from "primeng/menu";
import {ToastModule} from "primeng/toast";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {NgFor, NgIf, NgClass, AsyncPipe} from "@angular/common";

export interface NavItem {
    label: string;
    icon: string;
    route: string;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

// Sidebar groups and icons from DESIGN_GUIDELINES.md, section 3
const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Work', items: [
            {label: 'Dashboard', icon: 'pi pi-th-large', route: '/home'},
            {label: 'Projects', icon: 'pi pi-folder', route: '/projects'},
            {label: 'Calendar', icon: 'pi pi-calendar', route: '/calendar'},
        ]
    },
    {
        label: 'People', items: [
            {label: 'Architects', icon: 'pi pi-id-card', route: '/architects'},
            {label: 'Clients', icon: 'pi pi-users', route: '/clients'},
            {label: 'Contractors', icon: 'pi pi-wrench', route: '/contractors'},
            {label: 'Suppliers', icon: 'pi pi-truck', route: '/suppliers'},
        ]
    },
    {
        label: 'Finance', items: [
            {label: 'Financial report', icon: 'pi pi-chart-bar', route: '/financial-report'},
        ]
    },
    {
        label: 'Admin', items: [
            {label: 'Settings', icon: 'pi pi-cog', route: '/settings'},
        ]
    },
];

// Below this width the sidebar is an overlay opened from the top bar instead of a collapsible column
const DESKTOP_MEDIA_QUERY = '(min-width: 64rem)';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    standalone: true,
    imports: [ToastModule, ButtonModule, Menu, BreadcrumbModule, TooltipModule, NgFor, NgIf, NgClass, AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet]
})
export class AppComponent implements OnInit {
    title = 'Task-FE';

    sidebarCollapsed = false;
    mobileSidebarOpen = false;
    readonly navGroups = NAV_GROUPS;

    breadcrumbItems: MenuItem[] = [];
    // Pages migrated to DESIGN_GUIDELINES.md render their own title + breadcrumb header
    ownPageHeader = false;
    // The name and email sit in the menu's start template; items are actions only
    readonly userMenuItems: MenuItem[] = [
        {label: 'Log out', icon: 'pi pi-sign-out', command: () => this.logout()}
    ];
    userMenuOpen = false;

    @ViewChild('userMenu') userMenu!: Menu;

    readonly configurationStore = inject(ConfigurationStore);
    readonly userStore = inject(UserStore);
    // Holds the "Theme color" parameter; ThemeService applies it as soon as it loads
    private readonly systemParameterStore = inject(SystemParameterStore);
    private readonly authorization = inject(AuthorizationService);
    private readonly authUser = toSignal(this.authorization.getUser());
    // Backend user first; the Auth0 profile covers the time before (or a failure of) GET /users/current
    readonly $displayName = computed(() =>
        this.userStore.currentUser()?.username || this.authUser()?.name || this.authUser()?.email || '');
    readonly $email = computed(() => this.userStore.currentUser()?.email || this.authUser()?.email || '');

    constructor(protected authorizationService: AuthorizationService, private router: Router,
                private activatedRoute: ActivatedRoute, private breadcrumbService: BreadcrumbService) {
    }

    ngOnInit(): void {
        this.authorizationService.isAuthenticated()
            .subscribe(isAuthenticated => {
                if (isAuthenticated) {
                    this.configurationStore.loadConfiguration({});
                    this.userStore.loadCurrentUser({});
                    this.userStore.loadConfigurations({});
                    this.systemParameterStore.loadSystemParameters({});
                }
            })

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.breadcrumbItems = this.breadcrumbService.createBreadcrumbs(this.activatedRoute.root);
                let route = this.activatedRoute.snapshot;
                while (route.firstChild) {
                    route = route.firstChild;
                }
                this.ownPageHeader = route.data['ownPageHeader'] === true;
            });
    }

    login(): void {
        this.authorizationService.login();
    }

    logout(): void {
        this.authorizationService.logout();
    }

    get displayName(): string {
        return this.$displayName();
    }

    getUserInitial(): string {
        const name = this.$displayName();
        return name ? name.charAt(0).toUpperCase() : '?';
    }

    toggleUserMenu(event: Event): void {
        this.userMenu.toggle(event);
    }

    get email(): string {
        return this.$email();
    }

    onUserMenuShow(): void {
        this.userMenuOpen = true;
        this.alignUserMenuRight();
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
        if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        } else {
            this.mobileSidebarOpen = !this.mobileSidebarOpen;
        }
    }

    closeMobileSidebar(): void {
        this.mobileSidebarOpen = false;
    }
}
