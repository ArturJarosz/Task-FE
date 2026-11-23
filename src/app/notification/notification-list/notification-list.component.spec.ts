import {ComponentFixture, TestBed} from '@angular/core/testing';
import {format, addDays} from 'date-fns';

import {NotificationListComponent} from './notification-list.component';
import {Notification} from '../../generated/models/notification';
import {NotificationType} from '../../generated/models/notification-type';
import {provideTestDependencies} from '../../../testing/test-providers';

function day(offset: number): string {
    return format(addDays(new Date(), offset), 'yyyy-MM-dd');
}

describe('NotificationListComponent', () => {
    let fixture: ComponentFixture<NotificationListComponent>;

    const late: Notification = {id: 1, type: NotificationType.INSTALLMENT_OVERDUE, dueDate: day(-2), itemName: 'Stage 2',
        projectName: 'Villa Sopot', read: false};
    const tomorrow: Notification = {id: 2, type: NotificationType.STAGE_DEADLINE, dueDate: day(1), itemName: 'Concept',
        projectName: 'Villa Sopot', read: true};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NotificationListComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(NotificationListComponent);
    });

    function render(inputs: Record<string, unknown>): HTMLElement {
        Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    }

    it('groups the rows by when they are due', () => {
        const element = render({notifications: [late, tomorrow], loaded: true});

        const groups = element.querySelectorAll('section');
        expect(groups.length).toBe(2);
        expect(groups[0].getAttribute('aria-label')).toBe('Overdue');
        expect(groups[0].textContent).toContain('Installment overdue: Stage 2');
        expect(groups[1].getAttribute('aria-label')).toBe('Today and tomorrow');
        expect(groups[1].textContent).toContain('tomorrow');
    });

    it('opens the item from the text and only toggles read from the marker', () => {
        const element = render({notifications: [late], loaded: true});
        const opened: Notification[] = [];
        const toggled: Notification[] = [];
        fixture.componentInstance.opened.subscribe(notification => opened.push(notification));
        fixture.componentInstance.readToggled.subscribe(notification => toggled.push(notification));

        (element.querySelector('li > button') as HTMLButtonElement).click();
        (element.querySelector('p-button button') as HTMLButtonElement).click();

        expect(opened).toEqual([late]);
        expect(toggled).toEqual([late]);
        expect(element.querySelector('p-button button')?.getAttribute('aria-label'))
            .toBe('Mark as read: Installment overdue: Stage 2');
    });

    it('shows the empty state, and the error state with Try again', () => {
        let element = render({notifications: [], loaded: true, emptyTitle: 'You are all caught up'});
        expect(element.textContent).toContain('You are all caught up');

        const retried: void[] = [];
        fixture.componentInstance.retry.subscribe(() => retried.push(undefined));
        element = render({loadFailed: true});
        expect(element.textContent).toContain("Couldn't load notifications");
        (element.querySelector('p-button button') as HTMLButtonElement).click();
        expect(retried.length).toBe(1);
    });

    it('shows skeletons only before the first load', () => {
        let element = render({notifications: [], loading: true, loaded: false});
        expect(element.querySelector('p-skeleton')).not.toBeNull();

        element = render({notifications: [late], loading: true, loaded: true});
        expect(element.querySelector('p-skeleton')).toBeNull();
        expect(element.textContent).toContain('Installment overdue: Stage 2');
    });
});
