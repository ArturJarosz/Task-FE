import {ChangeDetectionStrategy, Component, inject, signal, viewChild} from "@angular/core";
import {Router} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {Popover, PopoverModule} from "primeng/popover";
import {Notification} from "../../generated/models/notification";
import {NotificationStore} from "../state/notification.state";
import {NotificationListComponent} from "../notification-list/notification-list.component";
import {notificationRoute} from "../model/notification-display";

/**
 * The bell's popup. Loaded on its own after the app has started (see the bell), as only it needs the popover.
 */
@Component({
    selector: 'app-notification-panel',
    templateUrl: './notification-panel.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, PopoverModule, NotificationListComponent]
})
export class NotificationPanelComponent {
    readonly notificationStore = inject(NotificationStore);
    private readonly router = inject(Router);
    private readonly popover = viewChild.required(Popover);

    readonly unread = signal(true);

    toggle(event: Event, target: HTMLElement): void {
        this.popover().toggle(event, target);
    }

    // Loaded on every opening, so the panel shows what the count says
    onShow(): void {
        this.notificationStore.openPanel(this.unread());
    }

    setUnread(unread: boolean): void {
        this.unread.set(unread);
        this.notificationStore.openPanel(unread);
    }

    openItem(notification: Notification): void {
        this.notificationStore.setRead({notification, read: true});
        this.popover().hide();
        this.router.navigate(notificationRoute(notification));
    }

    toggleRead(notification: Notification): void {
        this.notificationStore.setRead({notification, read: !notification.read});
    }

    markAllRead(): void {
        this.notificationStore.markAllRead({});
    }

    seeAll(): void {
        this.popover().hide();
        this.router.navigate(['/notifications'], {queryParams: {show: this.unread() ? null : 'all'}});
    }

    openSettings(): void {
        this.popover().hide();
        this.router.navigate(['/settings', 'notifications']);
    }
}
