import {TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {ProjectStore} from './project.state';
import {ClientStore} from '../../client/state/client.state';
import {ArchitectStore} from '../../architect/state/architect.state';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ProjectStore', () => {
    let store: InstanceType<typeof ProjectStore>;
    let clientStore: InstanceType<typeof ClientStore>;
    let architectStore: InstanceType<typeof ArchitectStore>;
    let httpTesting: HttpTestingController;

    // Both lists loaded, so only a change to projects can mark them stale again
    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(ProjectStore);
        clientStore = TestBed.inject(ClientStore);
        architectStore = TestBed.inject(ArchitectStore);
        httpTesting = TestBed.inject(HttpTestingController);

        clientStore.loadClients({});
        httpTesting.expectOne(request => request.url.endsWith('/clients')).flush([]);
        architectStore.loadArchitects({});
        httpTesting.expectOne(request => request.url.endsWith('/architects')).flush([]);
        expect(clientStore.clientsNeedRefresh()).toBeFalse();
        expect(architectStore.architectsNeedRefresh()).toBeFalse();
        store.setProjectId(1);
    });

    afterEach(() => httpTesting.verify());

    function expectListsStale(): void {
        expect(store.projectsNeedRefresh()).toBeTrue();
        expect(clientStore.clientsNeedRefresh()).toBeTrue();
        expect(architectStore.architectsNeedRefresh()).toBeTrue();
    }

    it('should not load clients again while nothing changed', () => {
        clientStore.loadClients({});
        httpTesting.expectNone(request => request.url.endsWith('/clients'));
        expect(clientStore.clientsNeedRefresh()).toBeFalse();
    });

    it('should mark clients and architects stale when a project is created', () => {
        store.createProject({projectCreate: {name: 'House'}});
        httpTesting.expectOne(request => request.method === 'POST').flush({id: 1, name: 'House'});

        expectListsStale();
    });

    it('should mark clients and architects stale when a project is updated', () => {
        store.updateProject({project: {name: 'House'}});
        httpTesting.expectOne(request => request.method === 'PUT').flush({id: 1, name: 'House'});

        expectListsStale();
    });

    it('should mark clients and architects stale when a project is removed', () => {
        store.removeProject({});
        httpTesting.expectOne(request => request.method === 'DELETE').flush(null);

        expectListsStale();
    });

    it('should leave clients and architects alone when a project update fails', () => {
        store.updateProject({project: {name: 'House'}});
        httpTesting.expectOne(request => request.method === 'PUT').flush('', {status: 500, statusText: 'Server error'});

        expect(clientStore.clientsNeedRefresh()).toBeFalse();
        expect(architectStore.architectsNeedRefresh()).toBeFalse();
    });

    it('should run afterSave only when the project update worked', () => {
        const afterSave = jasmine.createSpy('afterSave');
        store.updateProject({project: {name: 'House'}, afterSave});
        expect(store.saving()).toBeTrue();
        httpTesting.expectOne(request => request.method === 'PUT').flush('', {status: 400, statusText: 'Bad Request'});

        expect(afterSave).not.toHaveBeenCalled();
        expect(store.saving()).toBeFalse();

        store.updateProject({project: {name: 'House'}, afterSave});
        httpTesting.expectOne(request => request.method === 'PUT').flush({id: 1, name: 'House'});
        httpTesting.match(request => request.method === 'GET');

        expect(afterSave).toHaveBeenCalled();
        expect(store.saving()).toBeFalse();
    });
});
