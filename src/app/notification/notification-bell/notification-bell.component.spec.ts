import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {NotificationBellComponent} from './notification-bell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('NotificationBellComponent', () => {
    let fixture: ComponentFixture<NotificationBellComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NotificationBellComponent],
            providers: provideTestDependencies()
        });
        httpTesting = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(NotificationBellComponent);
    });

    function showCount(unread: number): HTMLElement {
        fixture.detectChanges();
        httpTesting.expectOne(request => request.url.endsWith('/notifications/count')).flush({unread});
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    }

    it('shows the unread count on the bell and in its label', () => {
        const element = showCount(4);

        expect(element.querySelector('.p-badge')?.textContent?.trim()).toBe('4');
        expect(element.querySelector('button')?.getAttribute('aria-label')).toBe('Notifications, 4 unread');
    });

    it('shows 9+ above nine', () => {
        const element = showCount(12);

        expect(element.querySelector('.p-badge')?.textContent?.trim()).toBe('9+');
    });

    it('shows no badge without unread notifications', () => {
        const element = showCount(0);

        // PrimeNG keeps a disabled badge in the page, hidden
        const badge = element.querySelector<HTMLElement>('.p-badge');
        expect(badge === null || getComputedStyle(badge).display === 'none').toBeTrue();
        expect(element.querySelector('button')?.getAttribute('aria-label')).toBe('Notifications');
    });
});
