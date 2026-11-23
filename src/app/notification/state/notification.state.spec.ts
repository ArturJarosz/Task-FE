import {TestBed} from '@angular/core/testing';
import {HttpRequest} from '@angular/common/http';
import {HttpTestingController} from '@angular/common/http/testing';

import {NotificationStore} from './notification.state';
import {Notification} from '../../generated/models/notification';
import {NotificationType} from '../../generated/models/notification-type';
import {provideTestDependencies} from '../../../testing/test-providers';

const UNREAD: Notification = {id: 1, type: NotificationType.STAGE_DEADLINE, dueDate: '2026-11-16', read: false};
const OTHER: Notification = {id: 2, type: NotificationType.MEETING, dueDate: '2026-11-17', read: false};

const isCount = (request: HttpRequest<unknown>) => request.url.endsWith('/notifications/count');
const isList = (request: HttpRequest<unknown>) => request.url.endsWith('/notifications');
const isReadAll = (request: HttpRequest<unknown>) => request.url.endsWith('/notifications/read-all');

describe('NotificationStore', () => {
    let store: InstanceType<typeof NotificationStore>;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(NotificationStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    function loadPanel(notifications: Notification[], unreadCount: number): void {
        store.loadCount({});
        httpTesting.expectOne(isCount).flush({unread: unreadCount});
        store.openPanel(true);
        httpTesting.expectOne(isList).flush({notifications, total: notifications.length});
    }

    it('should load the unread count and keep the last one when a refresh fails', () => {
        store.loadCount({});
        httpTesting.expectOne(isCount).flush({unread: 4});
        expect(store.unreadCount()).toBe(4);

        store.loadCount({});
        httpTesting.expectOne(isCount).flush('Server error', {status: 500, statusText: 'Server Error'});
        expect(store.unreadCount()).toBe(4);
        expect(store.countLoadFailed()).toBeTrue();
    });

    it('should load the panel with the unread filter and the panel size', () => {
        store.openPanel(true);
        const request = httpTesting.expectOne(isList);
        expect(request.request.params.get('unread')).toBe('true');
        expect(request.request.params.get('size')).toBe('20');
        request.flush({notifications: [UNREAD], total: 1});

        expect(store.panel().notifications).toEqual([UNREAD]);
        expect(store.panel().loaded).toBeTrue();
    });

    it('should show a failed load and keep loading the next time', () => {
        store.openPanel(true);
        httpTesting.expectOne(isList).flush('Server error', {status: 500, statusText: 'Server Error'});
        expect(store.panel().loadFailed).toBeTrue();

        store.openPanel(true);
        httpTesting.expectOne(isList).flush({notifications: [UNREAD], total: 1});
        expect(store.panel().loadFailed).toBeFalse();
        expect(store.panel().notifications).toEqual([UNREAD]);
    });

    it("should drop the last filter's rows when loading another filter fails", () => {
        loadPanel([UNREAD], 1);

        store.openPanel(false);
        httpTesting.expectOne(isList).flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.panel().loadFailed).toBeTrue();
        expect(store.panel().notifications).toEqual([]);
    });

    it('should send quick clicks on one marker one after another', () => {
        loadPanel([UNREAD], 1);

        store.setRead({notification: UNREAD, read: true});
        store.setRead({notification: store.panel().notifications[0], read: false});
        expect(store.panel().notifications[0].read).toBeFalse();
        expect(store.unreadCount()).toBe(1);

        const first = httpTesting.expectOne(req => req.url.endsWith('/notifications/1'));
        expect(first.request.body).toEqual({read: true});
        first.flush(null);
        const second = httpTesting.expectOne(req => req.url.endsWith('/notifications/1'));
        expect(second.request.body).toEqual({read: false});
        second.flush(null);
    });

    it('should mark a notification read at once and put it back when saving fails', () => {
        loadPanel([UNREAD, OTHER], 2);

        store.setRead({notification: UNREAD, read: true});
        expect(store.panel().notifications[0].read).toBeTrue();
        expect(store.unreadCount()).toBe(1);

        const request = httpTesting.expectOne(req => req.url.endsWith('/notifications/1'));
        expect(request.request.body).toEqual({read: true});
        request.flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.panel().notifications[0].read).toBeFalse();
        expect(store.unreadCount()).toBe(2);
    });

    it('should mark every notification read and the count 0', () => {
        loadPanel([UNREAD, OTHER], 2);

        store.markAllRead({});
        httpTesting.expectOne(isReadAll).flush(null);

        expect(store.unreadCount()).toBe(0);
        expect(store.panel().notifications.every(notification => notification.read)).toBeTrue();
    });

    it('should put back only the unread rows when marking all read fails', () => {
        loadPanel([UNREAD, OTHER], 2);

        store.markAllRead({});
        const request = httpTesting.expectOne(isReadAll);
        store.openPanel(false);
        httpTesting.expectOne(isList).flush({notifications: [{...OTHER, read: true}], total: 1});
        request.flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.unreadCount()).toBe(2);
        expect(store.panel().query.unread).toBeFalse();
        expect(store.panel().notifications).toEqual([{...OTHER, read: false}]);
    });

    it('should keep the page list apart from the panel list', () => {
        loadPanel([UNREAD], 1);

        store.openPage(false, NotificationType.MEETING, 1);
        const request = httpTesting.expectOne(isList);
        expect(request.request.params.get('unread')).toBe('false');
        expect(request.request.params.get('type')).toBe('MEETING');
        expect(request.request.params.get('page')).toBe('1');
        request.flush({notifications: [OTHER], total: 21});

        expect(store.page().notifications).toEqual([OTHER]);
        expect(store.page().total).toBe(21);
        expect(store.panel().notifications).toEqual([UNREAD]);
    });
});
