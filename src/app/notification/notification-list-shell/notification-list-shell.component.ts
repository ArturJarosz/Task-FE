import {ChangeDetectionStrategy, Component, computed, inject} from "@angular/core";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {map} from "rxjs";
import {ButtonModule} from "primeng/button";
import {SelectModule} from "primeng/select";
import {Notification} from "../../generated/models/notification";
import {NotificationType} from "../../generated/models/notification-type";
import {PageCrumb, PageHeaderComponent} from "../../shared/page-header/page-header.component";
import {TableFooterComponent} from "../../shared/table-footer/table-footer.component";
import {NotificationStore, PAGE_SIZE} from "../state/notification.state";
import {NotificationListComponent} from "../notification-list/notification-list.component";
import {NOTIFICATION_TYPE_TEXTS, notificationRoute} from "../model/notification-display";

interface PageFilter {
    unread: boolean;
    type: NotificationType | null;
    page: number;
}

/**
 * All notifications of the user. The filters are query parameters (`show=all`, `type`, `page`), so the browser's Back
 * button and a shared link keep them.
 */
@Component({
    selector: 'app-notification-list-shell',
    templateUrl: './notification-list-shell.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, ButtonModule, SelectModule, PageHeaderComponent, TableFooterComponent,
        NotificationListComponent]
})
export class NotificationListShellComponent {
    readonly notificationStore = inject(NotificationStore);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly crumbs: PageCrumb[] = [{label: 'Home', route: ['/home']}, {label: 'Notifications'}];
    readonly pageSize = PAGE_SIZE;
    readonly typeOptions = Object.values(NotificationType)
        .map(type => ({value: type, label: NOTIFICATION_TYPE_TEXTS[type].label}));

    readonly $filter = toSignal(this.route.queryParamMap.pipe(map((params): PageFilter => {
        const type = params.get('type') as NotificationType | null;
        return {
            unread: params.get('show') !== 'all',
            type: type && Object.values(NotificationType).includes(type) ? type : null,
            page: Math.max(Number(params.get('page')) || 0, 0)
        };
    })), {requireSync: true});

    readonly $subtitle = computed(() => {
        const total = this.notificationStore.page().total;
        const unread = this.$filter().unread;
        return `${total} ${unread ? 'unread' : ''} ${total === 1 ? 'notification' : 'notifications'}`
            .replace(/\s+/g, ' ');
    });

    constructor() {
        this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => {
            const filter = this.$filter();
            this.notificationStore.openPage(filter.unread, filter.type, filter.page);
        });
    }

    setFilter(change: Partial<PageFilter>): void {
        const filter = {...this.$filter(), page: 0, ...change};
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {show: filter.unread ? null : 'all', type: filter.type, page: filter.page || null}
        });
    }

    reload(): void {
        const filter = this.$filter();
        this.notificationStore.openPage(filter.unread, filter.type, filter.page);
    }

    openItem(notification: Notification): void {
        this.notificationStore.setRead({notification, read: true});
        this.router.navigate(notificationRoute(notification));
    }

    toggleRead(notification: Notification): void {
        this.notificationStore.setRead({notification, read: !notification.read});
    }

    markAllRead(): void {
        this.notificationStore.markAllRead({});
    }
}
