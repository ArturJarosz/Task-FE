import {ChangeDetectionStrategy, Component, computed, input, output, signal} from "@angular/core";
import {NgClass} from "@angular/common";
import {startOfDay} from "date-fns";
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {Notification} from "../../generated/models/notification";
import {EmptyStateComponent} from "../../shared/empty-state/empty-state.component";
import {updateAtMidnight} from "../../shared/utils/date-utils";
import {
    groupNotifications,
    notificationDate,
    notificationIcon,
    notificationTitle,
    notificationTone,
    NotificationTone,
    relativeDay
} from "../model/notification-display";

const TONE_CLASSES: Record<NotificationTone, string> = {
    overdue: 'bg-error-50 text-error-600',
    meeting: 'bg-brand-50 text-brand-600',
    due: 'bg-warning-50 text-warning-700'
};

interface NotificationRow {
    notification: Notification;
    title: string;
    date: string;
    relative: string;
    icon: string;
    toneClasses: string;
}

/**
 * Notifications grouped by when they are due, used by the bell's panel and the notifications page.
 */
@Component({
    selector: 'app-notification-list',
    templateUrl: './notification-list.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent]
})
export class NotificationListComponent {
    readonly notifications = input.required<Notification[]>();
    readonly loading = input(false);
    readonly loadFailed = input(false);
    // Loaded at least once: a reload keeps the rows instead of showing skeletons
    readonly loaded = input(false);
    readonly emptyTitle = input('Nothing due');

    readonly opened = output<Notification>();
    readonly readToggled = output<Notification>();
    readonly retry = output<void>();

    private readonly today = signal(startOfDay(new Date()));

    readonly groups = computed(() => {
        const today = this.today();
        return groupNotifications(this.notifications(), today).map(group => ({
            group: group.group,
            rows: group.notifications.map((notification): NotificationRow => ({
                notification,
                title: notificationTitle(notification),
                date: notificationDate(notification),
                relative: relativeDay(notification, today),
                icon: notificationIcon(notification),
                toneClasses: TONE_CLASSES[notificationTone(notification, today)]
            }))
        }));
    });

    constructor() {
        // The groups and "in 2 days" move on at midnight in a tab left open
        updateAtMidnight(() => this.today.set(startOfDay(new Date())));
    }
}
