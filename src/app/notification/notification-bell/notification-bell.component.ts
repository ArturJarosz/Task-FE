import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    NgZone,
    viewChild
} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {OverlayBadgeModule} from "primeng/overlaybadge";
import {TooltipModule} from "primeng/tooltip";
import {NotificationStore} from "../state/notification.state";
// Only a type here: a class reference outside the template would load the panel, and its popover, at start
import type {NotificationPanelComponent} from "../notification-panel/notification-panel.component";
import {NotificationPanelComponent as DeferredNotificationPanel} from "../notification-panel/notification-panel.component";

// The dates are days, so a few minutes late is fine; the count also reloads when the window gets focus again
const COUNT_REFRESH_MS = 5 * 60 * 1000;

/**
 * The top bar's bell with the unread count. Shown only to a logged-in user, so it stops refreshing on logout.
 */
@Component({
    selector: 'app-notification-bell',
    templateUrl: './notification-bell.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, OverlayBadgeModule, TooltipModule, DeferredNotificationPanel]
})
export class NotificationBellComponent {
    readonly notificationStore = inject(NotificationStore);
    private readonly bell = viewChild.required<ElementRef<HTMLElement>>('bell');
    private readonly panel = viewChild<NotificationPanelComponent>('panel');
    // A click before the panel's code has loaded opens it once it has
    private pendingOpen: Event | null = null;

    readonly $badge = computed(() => {
        const count = this.notificationStore.unreadCount() ?? 0;
        return count > 9 ? '9+' : `${count}`;
    });
    readonly $label = computed(() => {
        const count = this.notificationStore.unreadCount() ?? 0;
        if (count === 0) {
            return 'Notifications';
        }
        return `Notifications, ${count} unread`;
    });

    constructor() {
        this.notificationStore.loadCount({});
        this.refreshCount();
        effect(() => {
            const panel = this.panel();
            if (panel && this.pendingOpen) {
                panel.toggle(this.pendingOpen, this.bell().nativeElement);
                this.pendingOpen = null;
            }
        });
    }

    toggle(event: Event): void {
        const panel = this.panel();
        if (panel) {
            panel.toggle(event, this.bell().nativeElement);
        } else {
            this.pendingOpen = event;
        }
    }

    // Outside Angular, so a pending timer never keeps the app from being stable
    private refreshCount(): void {
        const zone = inject(NgZone);
        const refresh = () => {
            if (document.visibilityState === 'visible') {
                zone.run(() => this.notificationStore.loadCount({}));
            }
        };
        const timer = zone.runOutsideAngular(() => setInterval(refresh, COUNT_REFRESH_MS));
        window.addEventListener('focus', refresh);
        inject(DestroyRef).onDestroy(() => {
            clearInterval(timer);
            window.removeEventListener('focus', refresh);
        });
    }
}
