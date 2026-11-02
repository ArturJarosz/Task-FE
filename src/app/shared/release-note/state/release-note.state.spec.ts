import {TestBed} from '@angular/core/testing';
import {HttpRequest} from '@angular/common/http';
import {HttpTestingController} from '@angular/common/http/testing';

import {ReleaseNoteStore} from './release-note.state';
import {ReleaseNote} from '../../../generated/models/release-note';
import {ReleaseNoteType} from '../../../generated/models/release-note-type';
import {provideTestDependencies} from '../../../../testing/test-providers';

const NEWER: ReleaseNote = {
    id: 102, type: ReleaseNoteType.NEW, title: 'Newer', description: 'Newer change',
    createdDateTime: '2026-11-02T10:15:00'
};
const OLDER: ReleaseNote = {
    id: 101, type: ReleaseNoteType.FIXED, title: 'Older', description: 'Older change',
    createdDateTime: '2026-10-20T09:00:00'
};
const LAST_SEEN = '2026-10-14T16:30:00';

const isUnseen = (request: HttpRequest<unknown>) => request.url.endsWith('/release-notes/unseen');
const isAll = (request: HttpRequest<unknown>) => request.url.endsWith('/release-notes');
const isSeen = (request: HttpRequest<unknown>) => request.url.endsWith('/release-notes/seen');

describe('ReleaseNoteStore', () => {
    let store: InstanceType<typeof ReleaseNoteStore>;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        store = TestBed.inject(ReleaseNoteStore);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should open the dialog with the time the notes are listed since when there are unseen notes', () => {
        store.loadUnseen({});
        httpTesting.expectOne(isUnseen)
            .flush({since: LAST_SEEN, releaseNotes: [NEWER, OLDER]});

        expect(store.mode()).toBe('unseen');
        expect(store.releaseNotes()).toEqual([NEWER, OLDER]);
        expect(store.since()).toBe(LAST_SEEN);
    });

    it('should keep the dialog closed when every note has been seen or loading them fails', () => {
        store.loadUnseen({});
        httpTesting.expectOne(isUnseen)
            .flush({since: LAST_SEEN, releaseNotes: []});
        expect(store.mode()).toBeNull();

        store.loadUnseen({});
        httpTesting.expectOne(isUnseen)
            .flush('Server error', {status: 500, statusText: 'Server Error'});
        expect(store.mode()).toBeNull();
    });

    it('should mark the newest shown note as seen when the dialog is closed', () => {
        store.loadUnseen({});
        httpTesting.expectOne(isUnseen)
            .flush({since: LAST_SEEN, releaseNotes: [OLDER, NEWER]});

        store.close();

        const request = httpTesting.expectOne(isSeen);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({lastSeenId: NEWER.id});
        request.flush(null);
        expect(store.mode()).toBeNull();
        expect(store.releaseNotes()).toEqual([]);
        expect(store.since()).toBeNull();
    });

    it('should list the history since the oldest note and not replace it with unseen notes', () => {
        store.openHistory({});
        store.loadUnseen({});
        httpTesting.expectOne(isUnseen)
            .flush({since: LAST_SEEN, releaseNotes: [NEWER]});
        httpTesting.expectOne(isAll).flush([NEWER, OLDER]);

        expect(store.mode()).toBe('history');
        expect(store.releaseNotes()).toEqual([NEWER, OLDER]);
        expect(store.since()).toBe(OLDER.createdDateTime!);
    });

    it('should flag a failed history load and clear the flag on the next try', () => {
        store.openHistory({});
        expect(store.releaseNotesLoading()).toBeTrue();
        httpTesting.expectOne(isAll)
            .flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.releaseNotesLoadFailed()).toBeTrue();
        expect(store.releaseNotesLoading()).toBeFalse();

        store.openHistory({});
        expect(store.releaseNotesLoadFailed()).toBeFalse();
        httpTesting.expectOne(isAll).flush([NEWER]);

        expect(store.releaseNotes()).toEqual([NEWER]);
    });

    it('should send every seen mark, one after another, when the dialog is closed again', () => {
        store.loadUnseen({});
        httpTesting.expectOne(isUnseen)
            .flush({since: LAST_SEEN, releaseNotes: [OLDER]});
        store.close();
        store.openHistory({});
        httpTesting.expectOne(isAll).flush([NEWER, OLDER]);
        store.close();

        const first = httpTesting.expectOne(isSeen);
        expect(first.request.body).toEqual({lastSeenId: OLDER.id});
        first.flush(null);
        const second = httpTesting.expectOne(isSeen);
        expect(second.request.body).toEqual({lastSeenId: NEWER.id});
        second.flush(null);
    });

    it('should drop the history that arrives after the dialog was closed', () => {
        store.openHistory({});
        store.close();
        httpTesting.expectOne(isAll).flush([NEWER, OLDER]);

        expect(store.mode()).toBeNull();
        expect(store.releaseNotes()).toEqual([]);
        expect(store.releaseNotesLoading()).toBeFalse();

        store.openHistory({});
        store.close();
        httpTesting.expectOne(isAll)
            .flush('Server error', {status: 500, statusText: 'Server Error'});

        expect(store.releaseNotesLoadFailed()).toBeFalse();
    });

    it('should not save again when the dialog showed no note newer than the ones already marked', () => {
        store.loadUnseen({});
        httpTesting.expectOne(isUnseen).flush({since: LAST_SEEN, releaseNotes: [NEWER]});
        store.close();
        httpTesting.expectOne(isSeen).flush(null);

        store.openHistory({});
        httpTesting.expectOne(isAll).flush([NEWER, OLDER]);
        store.close();

        httpTesting.expectNone(isSeen);
        expect(store.markedSeenId()).toBe(NEWER.id!);
    });
});
