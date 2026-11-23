import {patchState, signalStore, withMethods, withState} from "@ngrx/signals";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {inject} from "@angular/core";
import {catchError, concatMap, EMPTY, filter, pipe, switchMap, tap} from "rxjs";
import {AppState} from "../../state/app.store";
import {Notification} from "../../generated/models/notification";
import {NotificationType} from "../../generated/models/notification-type";
import {NotificationQuery, NotificationRestService} from "../rest/notification-rest.service";

// The panel shows the first notifications only; the notifications page pages through all of them
export const PANEL_SIZE = 20;
export const PAGE_SIZE = 20;

export interface NotificationListState {
    notifications: Notification[];
    // Notifications matching the list's filter on all pages
    total: number;
    query: NotificationQuery;
    loading: boolean;
    loadFailed: boolean;
    // Loaded at least once, so a reload keeps the rows on screen instead of showing skeletons
    loaded: boolean;
}

export interface NotificationState extends AppState {
    // null until the first count has loaded
    unreadCount: number | null;
    countLoadFailed: boolean;
    // The bell's panel and the notifications page have lists of their own, so opening the panel on the page never
    // changes the page's filters
    panel: NotificationListState;
    page: NotificationListState;
}

function emptyList(size: number): NotificationListState {
    return {
        notifications: [], total: 0, query: {unread: true, type: null, page: 0, size}, loading: false,
        loadFailed: false, loaded: false
    };
}

export const initialState: NotificationState = {
    unreadCount: null,
    countLoadFailed: false,
    panel: emptyList(PANEL_SIZE),
    page: emptyList(PAGE_SIZE)
}

type ListName = 'panel' | 'page';

export const NotificationStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods((store, notificationRestService = inject(NotificationRestService)) => {
        const patchList = (name: ListName, list: Partial<NotificationListState>) =>
            patchState(store, state => ({[name]: {...state[name], ...list}}));

        // Marks rows read or unread in both lists at once, so the panel and the page never disagree
        const setRowsRead = (read: boolean, ids?: Set<number>) =>
            patchState(store, state => {
                const update = (list: NotificationListState) => ({
                    ...list,
                    notifications: list.notifications.map(notification =>
                        !ids || ids.has(notification.id ?? -1) ? {...notification, read} : notification)
                });
                return {panel: update(state.panel), page: update(state.page)};
            });

        const changeCount = (change: number) =>
            patchState(store, state => ({
                unreadCount: state.unreadCount === null ? null : Math.max(state.unreadCount + change, 0)
            }));

        const loadList = (name: ListName) => rxMethod<NotificationQuery>(
            pipe(
                tap(query => patchList(name, {query, loading: true, loadFailed: false})),
                switchMap(query => notificationRestService.getNotifications(query)
                    .pipe(
                        tap(result => patchList(name, {
                            notifications: result.notifications ?? [], total: result.total ?? 0, loading: false,
                            loaded: true
                        })),
                        // The REST service already shows the error toast; keep the stream alive for the next load. The
                        // rows of the last load are dropped, as they may belong to another filter
                        catchError(() => {
                            patchList(name, {notifications: [], total: 0, loading: false, loadFailed: true});
                            return EMPTY;
                        })
                    ))
            )
        );

        return {
            loadCount: rxMethod<{}>(
                pipe(
                    switchMap(() => notificationRestService.getNotificationCount()
                        .pipe(
                            tap(count => patchState(store, {unreadCount: count.unread ?? 0, countLoadFailed: false})),
                            // No toast for the count (see the REST service); the next refresh tries again
                            catchError(() => {
                                patchState(store, {countLoadFailed: true});
                                return EMPTY;
                            })
                        ))
                )
            ),
            loadPanel: loadList('panel'),
            loadPage: loadList('page'),
            // Shown at once and put back if saving fails, so a click on the marker answers straight away. The requests
            // are sent one after another, so quick clicks on one marker reach the backend in the order they were made
            setRead: rxMethod<{ notification: Notification, read: boolean }>(
                pipe(
                    filter(({notification, read}) => (notification.read === true) !== read),
                    tap(({notification, read}) => {
                        setRowsRead(read, new Set([notification.id!]));
                        changeCount(read ? -1 : 1);
                    }),
                    concatMap(({notification, read}) => notificationRestService.updateNotificationRead(notification.id!, read)
                        .pipe(
                            catchError(() => {
                                setRowsRead(!read, new Set([notification.id!]));
                                changeCount(read ? 1 : -1);
                                return EMPTY;
                            })
                        ))
                )
            ),
            markAllRead: rxMethod<{}>(
                pipe(
                    switchMap(() => {
                        // Only these rows are put back if saving fails, so a list loaded meanwhile is kept
                        const unreadIds = new Set([...store.panel().notifications, ...store.page().notifications]
                            .filter(notification => !notification.read).map(notification => notification.id!));
                        const unreadCount = store.unreadCount();
                        setRowsRead(true);
                        patchState(store, {unreadCount: 0});
                        return notificationRestService.markAllNotificationsRead()
                            .pipe(
                                catchError(() => {
                                    setRowsRead(false, unreadIds);
                                    patchState(store, {unreadCount});
                                    return EMPTY;
                                })
                            );
                    })
                )
            ),
        };
    }),
    withMethods(store => ({
        openPanel(unread: boolean) {
            store.loadPanel({unread, type: null, page: 0, size: PANEL_SIZE});
        },
        openPage(unread: boolean, type: NotificationType | null, page: number) {
            store.loadPage({unread, type, page, size: PAGE_SIZE});
        }
    }))
)
