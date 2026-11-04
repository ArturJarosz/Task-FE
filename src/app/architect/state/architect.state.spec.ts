import {TestBed} from '@angular/core/testing';
import {patchState} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {MessageService} from 'primeng/api';
import {of, throwError} from 'rxjs';

import {ArchitectStore} from './architect.state';
import {ArchitectRestService} from '../rest/architect-rest.service';

describe('ArchitectStore linking an account', () => {
    const linkedUser = {id: 1, username: 'Maria', email: 'maria@example.com'};
    let restService: jasmine.SpyObj<ArchitectRestService>;
    let messageService: jasmine.SpyObj<MessageService>;
    let store: InstanceType<typeof ArchitectStore>;

    beforeEach(() => {
        restService = jasmine.createSpyObj('ArchitectRestService', ['linkUser', 'unlinkUser']);
        messageService = jasmine.createSpyObj('MessageService', ['add']);
        TestBed.configureTestingModule({
            providers: [
                {provide: ArchitectRestService, useValue: restService},
                {provide: MessageService, useValue: messageService},
            ]
        });
        store = TestBed.inject(ArchitectStore);
    });

    it('updates the architect in the list and reports a saved link', () => {
        patchState(unprotected(store), {architects: [{id: 10}, {id: 11}]});
        restService.linkUser.and.returnValue(of({id: 10, linkedUser}));
        let afterSave = jasmine.createSpy('afterSave');
        let onError = jasmine.createSpy('onError');

        store.linkUser({architectId: 10, userId: 1, afterSave, onError});

        expect(restService.linkUser).toHaveBeenCalledOnceWith(10, 1);
        expect(store.architects()).toEqual([{id: 10, linkedUser}, {id: 11}]);
        expect(store.accountSaving()).toBeFalse();
        expect(messageService.add).toHaveBeenCalledTimes(1);
        expect(afterSave).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it('keeps the dialog open and the store working after a failed link', () => {
        restService.linkUser.and.returnValues(throwError(() => new Error('taken')), of({id: 10, linkedUser}));
        let afterSave = jasmine.createSpy('afterSave');
        let onError = jasmine.createSpy('onError');

        store.linkUser({architectId: 10, userId: 1, afterSave, onError});

        expect(afterSave).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(store.accountSaving()).toBeFalse();

        store.linkUser({architectId: 10, userId: 1, afterSave, onError});

        expect(afterSave).toHaveBeenCalledTimes(1);
    });

    it('removes the link', () => {
        patchState(unprotected(store), {architects: [{id: 10, linkedUser}]});
        restService.unlinkUser.and.returnValue(of({id: 10}));
        let afterSave = jasmine.createSpy('afterSave');

        store.unlinkUser({architectId: 10, afterSave});

        expect(restService.unlinkUser).toHaveBeenCalledOnceWith(10);
        expect(store.architects()).toEqual([{id: 10}]);
        expect(afterSave).toHaveBeenCalledTimes(1);
    });
});
