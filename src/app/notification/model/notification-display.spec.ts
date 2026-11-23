import {Notification} from '../../generated/models/notification';
import {NotificationType} from '../../generated/models/notification-type';
import {NotificationItemType} from '../../generated/models/notification-item-type';
import {
    groupNotifications,
    notificationDate,
    notificationGroup,
    notificationRoute,
    notificationTitle,
    notificationTone,
    relativeDay
} from './notification-display';

const TODAY = new Date(2026, 10, 15);

function due(type: NotificationType, dueDate: string, extra: Partial<Notification> = {}): Notification {
    return {id: 1, type, dueDate, itemId: 9, projectId: 4, ...extra};
}

describe('notification display', () => {
    it('should group by when the item is due', () => {
        expect(notificationGroup(due(NotificationType.STAGE_DEADLINE, '2026-11-14'), TODAY)).toBe('Overdue');
        expect(notificationGroup(due(NotificationType.STAGE_DEADLINE, '2026-11-16'), TODAY)).toBe('Today and tomorrow');
        expect(notificationGroup(due(NotificationType.STAGE_DEADLINE, '2026-11-22'), TODAY)).toBe('This week');
        expect(notificationGroup(due(NotificationType.STAGE_DEADLINE, '2026-11-23'), TODAY)).toBe('Later');
    });

    it('should count an overdue installment as overdue and a meeting still on as not late', () => {
        expect(notificationGroup(due(NotificationType.INSTALLMENT_OVERDUE, '2026-11-14'), TODAY)).toBe('Overdue');
        expect(notificationGroup(due(NotificationType.MEETING, '2026-11-14'), TODAY)).toBe('Today and tomorrow');
        expect(notificationTone(due(NotificationType.MEETING, '2026-11-16'), TODAY)).toBe('meeting');
        expect(notificationTone(due(NotificationType.CONTRACT_DEADLINE, '2026-11-14'), TODAY)).toBe('overdue');
        expect(notificationTone(due(NotificationType.CONTRACT_DEADLINE, '2026-11-18'), TODAY)).toBe('due');
    });

    it('should leave out empty groups and keep the order inside a group', () => {
        const first = due(NotificationType.STAGE_DEADLINE, '2026-11-15', {id: 1});
        const second = due(NotificationType.CONTRACT_DEADLINE, '2026-11-16', {id: 2});
        const later = due(NotificationType.CONTRACT_DEADLINE, '2026-12-20', {id: 3});

        const groups = groupNotifications([first, second, later], TODAY);

        expect(groups.map(group => group.group)).toEqual(['Today and tomorrow', 'Later']);
        expect(groups[0].notifications).toEqual([first, second]);
    });

    it('should name the type and the item, and the deposit by its type', () => {
        expect(notificationTitle(due(NotificationType.STAGE_DEADLINE, '2026-11-16', {itemName: 'Concept'})))
            .toBe('Stage deadline: Concept');
        expect(notificationTitle(due(NotificationType.INSTALLMENT_PAYMENT, '2026-11-16', {itemName: 'Stage 2'})))
            .toBe('Installment due: Stage 2');
        expect(notificationTitle(due(NotificationType.INSTALLMENT_OVERDUE, '2026-11-14'))).toBe('Deposit overdue');
        expect(notificationTitle(due(NotificationType.MEETING, '2026-11-16', {itemName: 'Site visit'})))
            .toBe('Site visit');
    });

    it('should show the date, the hour of a meeting and how far away it is', () => {
        expect(notificationDate(due(NotificationType.STAGE_DEADLINE, '2026-11-18'))).toBe('18.11.2026');
        expect(notificationDate(due(NotificationType.MEETING, '2026-11-16', {dueDateTime: '2026-11-16T10:00:00'})))
            .toBe('16.11.2026, 10:00');
        expect(relativeDay(due(NotificationType.STAGE_DEADLINE, '2026-11-15'), TODAY)).toBe('today');
        expect(relativeDay(due(NotificationType.STAGE_DEADLINE, '2026-11-16'), TODAY)).toBe('tomorrow');
        expect(relativeDay(due(NotificationType.STAGE_DEADLINE, '2026-11-18'), TODAY)).toBe('in 3 days');
        expect(relativeDay(due(NotificationType.STAGE_DEADLINE, '2026-11-12'), TODAY)).toBe('3 days ago');
    });

    it('should open the page of the item', () => {
        expect(notificationRoute(due(NotificationType.INSTALLMENT_OVERDUE, '2026-11-14')))
            .toEqual(['/projects', 4, 'installments', 9]);
        expect(notificationRoute(due(NotificationType.STAGE_DEADLINE, '2026-11-14', {
            itemType: NotificationItemType.STAGE}))).toEqual(['/projects', 4, 'stages', 9]);
        expect(notificationRoute(due(NotificationType.CONTRACT_DEADLINE, '2026-11-14'))).toEqual(['/projects', 4]);
        expect(notificationRoute(due(NotificationType.MEETING, '2026-11-14'))).toEqual(['/calendar']);
        expect(notificationRoute(due(NotificationType.COMPANY_COST_PAYMENT, '2026-11-14')))
            .toEqual(['/company-costs', 9]);
    });
});
