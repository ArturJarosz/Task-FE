import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {DashboardStore} from './dashboard.state';
import {UserStore} from '../../shared/user/state';
import {UserConfigurationName} from '../../generated/models/user-configuration-name';
import {DashboardLayout, DEFAULT_DASHBOARD_LAYOUT, serializeDashboardLayout} from '../layout/dashboard-layout';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('DashboardStore', () => {
    let store: InstanceType<typeof DashboardStore>;
    let userStore: InstanceType<typeof UserStore>;
    let httpTesting: HttpTestingController;

    const saved: DashboardLayout = {
        rows: [{stacks: [{width: 100, widgets: [{type: 'upcoming-events'}, {type: 'year-summary'}]}]}]
    };
    const isConfigurationsRequest = (url: string) => url.endsWith('/users/current/configurations');
    const isLayoutSave = (url: string) => url.endsWith('/users/current/configurations/DASHBOARD_LAYOUT');

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(DashboardStore);
        userStore = TestBed.inject(UserStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should wait for the user settings, then show the default layout when none is saved', () => {
        expect(store.layoutLoading()).toBeTrue();

        userStore.loadConfigurations({});
        httpTesting.expectOne(request => isConfigurationsRequest(request.url))
            .flush([{name: UserConfigurationName.THEME_MODE, value: 'DARK'}]);

        expect(store.layoutLoading()).toBeFalse();
        expect(store.layout()).toEqual(DEFAULT_DASHBOARD_LAYOUT);
    });

    it('should show the saved layout', () => {
        userStore.loadConfigurations({});
        httpTesting.expectOne(request => isConfigurationsRequest(request.url))
            .flush([{name: UserConfigurationName.DASHBOARD_LAYOUT, value: serializeDashboardLayout(saved)}]);

        expect(store.layout()).toEqual(saved);
    });

    it('should show the default layout when the user settings fail to load', () => {
        userStore.loadConfigurations({});
        httpTesting.expectOne(request => isConfigurationsRequest(request.url))
            .flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.layoutLoading()).toBeFalse();
        expect(store.layout()).toEqual(DEFAULT_DASHBOARD_LAYOUT);
    });

    it('should edit a copy of the layout and drop it on cancel', () => {
        store.startEditing();
        expect(store.editing()).toBeTrue();
        expect(store.draftLayout()).toEqual(DEFAULT_DASHBOARD_LAYOUT);

        store.updateDraft(saved);
        store.cancelEditing();

        expect(store.editing()).toBeFalse();
        expect(store.layout()).toEqual(DEFAULT_DASHBOARD_LAYOUT);
    });

    it('should save the draft for the user and leave edit mode', () => {
        store.startEditing();
        store.updateDraft({rows: [...saved.rows, {stacks: []}]});
        store.saveLayout({});

        expect(store.layoutSaving()).toBeTrue();
        const request = httpTesting.expectOne(request => isLayoutSave(request.url));
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({
            name: UserConfigurationName.DASHBOARD_LAYOUT,
            value: serializeDashboardLayout(saved)
        });
        request.flush(request.request.body);

        expect(store.layoutSaving()).toBeFalse();
        expect(store.editing()).toBeFalse();
        expect(store.layout()).toEqual(saved);
    });

    it('should stay in edit mode with the draft when saving fails, and save on the next try', () => {
        store.startEditing();
        store.updateDraft(saved);
        store.saveLayout({});
        httpTesting.expectOne(request => isLayoutSave(request.url))
            .flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.layoutSaving()).toBeFalse();
        expect(store.draftLayout()).toEqual(saved);

        store.saveLayout({});
        const retry = httpTesting.expectOne(request => isLayoutSave(request.url));
        retry.flush(retry.request.body);

        expect(store.layout()).toEqual(saved);
    });
});
