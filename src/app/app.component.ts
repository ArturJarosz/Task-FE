import {ApplicationRef, Component, computed, DestroyRef, HostListener, inject, OnInit, ViewChild} from '@angular/core';
import {toSignal} from "@angular/core/rxjs-interop";
import {MenuItem} from "primeng/api";
import {ConfigurationStore} from "./shared/configuration/state";
import {UserStore} from "./shared/user/state";
import {ReleaseNoteStore} from "./shared/release-note/state";
import {WhatsNewDialogComponent} from "./shared/release-note/whats-new-dialog/whats-new-dialog.component";
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
import {NgClass, AsyncPipe} from "@angular/common";
import {endsTextSelectionInRow} from "./shared/utils/row-click";

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

// What can take focus inside a dialog
const DIALOG_FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    standalone: true,
    imports: [ToastModule, ButtonModule, Menu, BreadcrumbModule, TooltipModule, NgClass, AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet,
        WhatsNewDialogComponent]
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
        {label: "What's new", icon: 'pi pi-megaphone', command: () => this.releaseNoteStore.openHistory({})},
        {label: 'Log out', icon: 'pi pi-sign-out', command: () => this.logout()}
    ];
    userMenuOpen = false;

    @ViewChild('userMenu') userMenu!: Menu;

    readonly configurationStore = inject(ConfigurationStore);
    readonly userStore = inject(UserStore);
    // Holds the "What's new" dialog, opened after login when there are changes the user hasn't seen
    readonly releaseNoteStore = inject(ReleaseNoteStore);
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
        this.restoreFocusAfterDialogs();
        this.keepRowOpenFromTextSelection();
    }

    private readonly appRef = inject(ApplicationRef);

    // PrimeNG 21 binds a dialog's Escape listener from its opening animation, outside Angular's zone, so Escape closed
    // the dialog without redrawing it: it stayed on screen until the next click. This listener runs inside the zone and
    // redraws once the dialog has handled the key (a timeout, because listeners run in the order they were added)
    @HostListener('document:keydown.escape')
    onEscape(): void {
        setTimeout(() => this.appRef.tick());
    }

    // The control that had focus before a dialog or popup opened. PrimeNG leaves focus on the page body when a dialog
    // closes, so keyboard users lost their place; it goes back to this control (the button that opened the dialog)
    private focusBeforeDialog: HTMLElement | null = null;

    @HostListener('document:focusin', ['$event'])
    onFocusIn(event: FocusEvent): void {
        let target = event.target as HTMLElement | null;
        if (target instanceof HTMLElement && !target.closest('.p-dialog, .p-overlay-mask, .p-popover, .p-menu-overlay, [role="dialog"]')) {
            this.focusBeforeDialog = target;
        }
    }

    // Copying text from a table row: the click that ends the selection stops here, before it reaches the row's routerLink
    private keepRowOpenFromTextSelection(): void {
        let listener = (event: MouseEvent) => {
            if (endsTextSelectionInRow(event)) {
                event.stopPropagation();
            }
        };
        document.addEventListener('click', listener, true);
        inject(DestroyRef).onDestroy(() => document.removeEventListener('click', listener, true));
    }

    private restoreFocusAfterDialogs(): void {
        let observer = new MutationObserver(records => {
            let dialogClosed = records.some(record => Array.from(record.removedNodes)
                .some(node => node instanceof HTMLElement && (node.matches('.p-dialog-mask, .p-overlay-mask') || !!node.querySelector('.p-dialog'))));
            if (!dialogClosed) {
                return;
            }
            // After the dialog is gone: only when focus fell back to the body, and the control is still on the page
            setTimeout(() => {
                if (document.activeElement !== document.body && document.activeElement) {
                    return;
                }
                // Another dialog is still open (Edit time entry closed over Time entries): focus stays in it, not on the
                // page behind its mask
                let openDialogs = document.querySelectorAll('.p-dialog');
                if (openDialogs.length) {
                    openDialogs[openDialogs.length - 1].querySelector<HTMLElement>(DIALOG_FOCUSABLE)?.focus();
                    return;
                }
                let target = this.focusBeforeDialog;
                if (target?.isConnected) {
                    target.focus();
                }
            });
        });
        observer.observe(document.body, {childList: true});
        inject(DestroyRef).onDestroy(() => observer.disconnect());
    }

    ngOnInit(): void {
        this.authorizationService.isAuthenticated()
            .subscribe(isAuthenticated => {
                if (isAuthenticated) {
                    this.configurationStore.loadConfiguration({});
                    this.userStore.loadCurrentUser({});
                    this.userStore.loadConfigurations({});
                    this.systemParameterStore.loadSystemParameters({});
                    this.releaseNoteStore.loadUnseen({});
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

    get userMenuLabel(): string {
        return this.displayName ? `${this.displayName}, open account menu` : 'Open account menu';
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
