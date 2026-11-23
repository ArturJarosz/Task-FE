import {differenceInCalendarDays, format, parseISO} from "date-fns";
import {Notification} from "../../generated/models/notification";
import {NotificationType} from "../../generated/models/notification-type";

export type NotificationGroup = 'Overdue' | 'Today and tomorrow' | 'This week' | 'Later';

// Tile colours: red for anything late, blue for meetings, amber for the other dates coming up
export type NotificationTone = 'overdue' | 'meeting' | 'due';

export interface NotificationTypeText {
    // The type's name in Settings and the type filter
    label: string;
    icon: string;
}

export const NOTIFICATION_TYPE_TEXTS: Record<NotificationType, NotificationTypeText> = {
    [NotificationType.MEETING]: {label: 'Meetings', icon: 'pi pi-calendar'},
    [NotificationType.INSTALLMENT_PAYMENT]: {label: 'Installment payments', icon: 'pi pi-wallet'},
    [NotificationType.INSTALLMENT_OVERDUE]: {label: 'Overdue installments', icon: 'pi pi-exclamation-circle'},
    [NotificationType.CONTRACT_DEADLINE]: {label: 'Contract deadlines', icon: 'pi pi-file'},
    [NotificationType.STAGE_DEADLINE]: {label: 'Stage deadlines', icon: 'pi pi-flag'},
    [NotificationType.COMPANY_COST_PAYMENT]: {label: 'Company cost payments', icon: 'pi pi-briefcase'},
};

export const NOTIFICATION_GROUPS: NotificationGroup[] = ['Overdue', 'Today and tomorrow', 'This week', 'Later'];

export interface NotificationGroupRows {
    group: NotificationGroup;
    notifications: Notification[];
}

// Dates come as local days ("2026-11-18"), so they are read with parseISO, never as UTC midnight
function dueDay(notification: Notification): Date {
    return parseISO(notification.dueDate ?? '');
}

function daysFromToday(notification: Notification, today: Date): number {
    return differenceInCalendarDays(dueDay(notification), today);
}

// A meeting that has started but not ended (one over several days) is still on, not late
export function isOverdue(notification: Notification, today: Date): boolean {
    return notification.type === NotificationType.INSTALLMENT_OVERDUE
        || (notification.type !== NotificationType.MEETING && daysFromToday(notification, today) < 0);
}

export function notificationGroup(notification: Notification, today: Date): NotificationGroup {
    if (isOverdue(notification, today)) {
        return 'Overdue';
    }
    const days = daysFromToday(notification, today);
    if (days <= 1) {
        return 'Today and tomorrow';
    }
    return days <= 7 ? 'This week' : 'Later';
}

// Rows keep the backend's order (earliest due first) inside their group; empty groups are left out
export function groupNotifications(notifications: Notification[], today: Date): NotificationGroupRows[] {
    return NOTIFICATION_GROUPS
        .map(group => ({
            group,
            notifications: notifications.filter(notification => notificationGroup(notification, today) === group)
        }))
        .filter(rows => rows.notifications.length > 0);
}

export function notificationTone(notification: Notification, today: Date): NotificationTone {
    if (isOverdue(notification, today)) {
        return 'overdue';
    }
    return notification.type === NotificationType.MEETING ? 'meeting' : 'due';
}

export function notificationIcon(notification: Notification): string {
    return notification.type ? NOTIFICATION_TYPE_TEXTS[notification.type].icon : 'pi pi-bell';
}

// A deposit is the one installment without a stage, so it has no name
export function notificationTitle(notification: Notification): string {
    const name = notification.itemName;
    switch (notification.type) {
        case NotificationType.MEETING:
            return name || 'Meeting';
        case NotificationType.INSTALLMENT_PAYMENT:
            return name ? `Installment due: ${name}` : 'Deposit due';
        case NotificationType.INSTALLMENT_OVERDUE:
            return name ? `Installment overdue: ${name}` : 'Deposit overdue';
        case NotificationType.CONTRACT_DEADLINE:
            return 'Contract deadline';
        case NotificationType.STAGE_DEADLINE:
            return `Stage deadline: ${name ?? ''}`;
        case NotificationType.COMPANY_COST_PAYMENT:
            return `Company cost due: ${name ?? ''}`;
        default:
            return name ?? '';
    }
}

// "18.11.2026", with the hour for a meeting that isn't all day: "18.11.2026, 10:00"
export function notificationDate(notification: Notification): string {
    if (notification.dueDateTime) {
        return format(parseISO(notification.dueDateTime), 'dd.MM.yyyy, HH:mm');
    }
    return notification.dueDate ? format(dueDay(notification), 'dd.MM.yyyy') : '';
}

export function relativeDay(notification: Notification, today: Date): string {
    const days = daysFromToday(notification, today);
    if (days === 0) {
        return 'today';
    }
    if (days === 1) {
        return 'tomorrow';
    }
    if (days === -1) {
        return 'yesterday';
    }
    return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

export function notificationRoute(notification: Notification): unknown[] {
    const projectId = notification.projectId;
    switch (notification.type) {
        case NotificationType.MEETING:
            return ['/calendar'];
        case NotificationType.INSTALLMENT_PAYMENT:
        case NotificationType.INSTALLMENT_OVERDUE:
            return ['/projects', projectId, 'installments', notification.itemId];
        case NotificationType.CONTRACT_DEADLINE:
            return ['/projects', projectId];
        case NotificationType.STAGE_DEADLINE:
            return ['/projects', projectId, 'stages', notification.itemId];
        case NotificationType.COMPANY_COST_PAYMENT:
            return ['/company-costs', notification.itemId];
        default:
            return ['/notifications'];
    }
}
