import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {MessageService} from 'primeng/api';

import {TimeEntryStore, TimeEntryTask} from './time-entry.state';
import {TimeEntryRestService} from '../rest/time-entry-rest.service';
import {TaskStore} from '../../task/state/task.state';
import {StageStore} from '../../stage/state';
import {ProjectStore, ProjectTimeSummaryStore} from '../../project/state';
import {TimeEntry} from '../../generated/models/time-entry';
import {provideTestDependencies} from '../../../testing/test-providers';

const TASK: TimeEntryTask = {projectId: 1, stageId: 2, taskId: 3};
const OTHER_TASK: TimeEntryTask = {projectId: 1, stageId: 2, taskId: 4};
const LATEST: TimeEntry = {id: 11, workDate: '2026-11-03', architectId: 7, durationMinutes: 150, note: 'Second variant'};
const EARLIER: TimeEntry = {id: 10, workDate: '2026-10-28', architectId: 7, durationMinutes: 45};

describe('TimeEntryStore', () => {
    let store: InstanceType<typeof TimeEntryStore>;
    let restService: jasmine.SpyObj<TimeEntryRestService>;

    beforeEach(() => {
        restService = jasmine.createSpyObj<TimeEntryRestService>('TimeEntryRestService',
            ['getTimeEntries', 'createTimeEntry', 'updateTimeEntry', 'deleteTimeEntry']);
        restService.getTimeEntries.and.returnValue(of([LATEST, EARLIER]));
        TestBed.configureTestingModule({
            providers: [...provideTestDependencies(), {provide: TimeEntryRestService, useValue: restService}]
        });
        store = TestBed.inject(TimeEntryStore);
    });

    function loadEntriesOf(task: TimeEntryTask): void {
        store.setTask(task);
        store.loadTimeEntries();
    }

    function spyOnTotals() {
        return {
            refreshTask: spyOn(TestBed.inject(TaskStore), 'refreshTask'),
            refreshStage: spyOn(TestBed.inject(StageStore), 'refreshStage'),
            refreshStages: spyOn(TestBed.inject(StageStore), 'refreshStages'),
            refreshProject: spyOn(TestBed.inject(ProjectStore), 'setProjectNeedsRefresh'),
            refreshTimeSummary: spyOn(TestBed.inject(ProjectTimeSummaryStore), 'setTimeSummaryNeedsRefresh'),
        };
    }

    it('should load the entries of the task and add up their time', () => {
        expect(store.timeEntriesLoading()).toBeTrue();

        loadEntriesOf(TASK);

        expect(restService.getTimeEntries).toHaveBeenCalledOnceWith(1, 2, 3);
        expect(store.timeEntries()).toEqual([LATEST, EARLIER]);
        expect(store.timeEntriesLoading()).toBeFalse();
        expect(store.timeEntriesMinutes()).toBe(195);
    });

    it('should flag a failed load and load again on the next call', () => {
        restService.getTimeEntries.and.returnValue(throwError(() => 'Response code: 500'));
        loadEntriesOf(TASK);
        expect(store.timeEntriesLoadFailed()).toBeTrue();
        expect(store.timeEntriesLoading()).toBeFalse();

        restService.getTimeEntries.and.returnValue(of([LATEST]));
        store.loadTimeEntries();

        expect(store.timeEntriesLoadFailed()).toBeFalse();
        expect(store.timeEntries()).toEqual([LATEST]);
    });

    it('should drop the entries of the previous task when another task is opened', () => {
        loadEntriesOf(TASK);

        store.setTask(OTHER_TASK);

        expect(store.timeEntries()).toEqual([]);
        expect(store.timeEntriesLoading()).toBeTrue();
    });

    it('should log time, then reload the entries and every total that sums it up', () => {
        loadEntriesOf(TASK);
        const totals = spyOnTotals();
        const toast = spyOn(TestBed.inject(MessageService), 'add');
        const afterSave = jasmine.createSpy('afterSave');
        const newEntry: TimeEntry = {workDate: '2026-11-04', architectId: 7, durationMinutes: 90};
        restService.createTimeEntry.and.returnValue(of({...newEntry, id: 12}));

        store.saveTimeEntry({task: TASK, timeEntry: newEntry, afterSave});

        expect(restService.createTimeEntry).toHaveBeenCalledOnceWith(1, 2, 3, newEntry);
        expect(restService.updateTimeEntry).not.toHaveBeenCalled();
        expect(restService.getTimeEntries).toHaveBeenCalledTimes(2);
        expect(totals.refreshTask).toHaveBeenCalledWith(3);
        expect(totals.refreshStage).toHaveBeenCalled();
        expect(totals.refreshStages).toHaveBeenCalled();
        expect(totals.refreshProject).toHaveBeenCalled();
        expect(totals.refreshTimeSummary).toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(jasmine.objectContaining(
            {summary: 'Time logged', detail: '1 h 30 min was added to the task.'}));
        expect(afterSave).toHaveBeenCalled();
        expect(store.timeEntrySaving()).toBeFalse();
    });

    it('should save an entry that has an id as an edit', () => {
        loadEntriesOf(TASK);
        const edited: TimeEntry = {...LATEST, durationMinutes: 120};
        restService.updateTimeEntry.and.returnValue(of(edited));

        store.saveTimeEntry({task: TASK, timeEntry: edited});

        expect(restService.updateTimeEntry).toHaveBeenCalledOnceWith(1, 2, 3, 11, edited);
        expect(restService.createTimeEntry).not.toHaveBeenCalled();
        expect(restService.getTimeEntries).toHaveBeenCalledTimes(2);
    });

    it('should keep the dialog open after a failed save and still save the next time', () => {
        loadEntriesOf(TASK);
        const afterSave = jasmine.createSpy('afterSave');
        restService.createTimeEntry.and.returnValue(throwError(() => 'Response code: 400'));

        store.saveTimeEntry({task: TASK, timeEntry: {durationMinutes: 1441}, afterSave});

        expect(afterSave).not.toHaveBeenCalled();
        expect(store.timeEntrySaving()).toBeFalse();
        expect(restService.getTimeEntries).toHaveBeenCalledTimes(1);

        restService.createTimeEntry.and.returnValue(of({id: 12, durationMinutes: 60}));
        store.saveTimeEntry({task: TASK, timeEntry: {durationMinutes: 60}, afterSave});

        expect(afterSave).toHaveBeenCalledTimes(1);
    });

    it('should update the totals but not the shown entries when time is logged on another task', () => {
        loadEntriesOf(TASK);
        const totals = spyOnTotals();
        restService.createTimeEntry.and.returnValue(of({id: 12, durationMinutes: 60}));

        store.saveTimeEntry({task: OTHER_TASK, timeEntry: {durationMinutes: 60}});

        expect(restService.createTimeEntry).toHaveBeenCalledOnceWith(1, 2, 4, {durationMinutes: 60});
        expect(restService.getTimeEntries).toHaveBeenCalledTimes(1);
        expect(totals.refreshTask).toHaveBeenCalledWith(4);
        expect(totals.refreshStage).toHaveBeenCalled();
        expect(totals.refreshTimeSummary).toHaveBeenCalled();
    });

    it('should delete an entry, then reload the entries and the totals', () => {
        loadEntriesOf(TASK);
        const totals = spyOnTotals();
        restService.deleteTimeEntry.and.returnValue(of(undefined));
        restService.getTimeEntries.and.returnValue(of([EARLIER]));

        store.deleteTimeEntry({task: TASK, timeEntry: LATEST});

        expect(restService.deleteTimeEntry).toHaveBeenCalledOnceWith(1, 2, 3, 11);
        expect(store.timeEntries()).toEqual([EARLIER]);
        expect(totals.refreshTask).toHaveBeenCalledWith(3);
        expect(totals.refreshProject).toHaveBeenCalled();
    });

    it('should keep deleting after a failed delete', () => {
        loadEntriesOf(TASK);
        restService.deleteTimeEntry.and.returnValue(throwError(() => 'Response code: 400'));
        store.deleteTimeEntry({task: TASK, timeEntry: LATEST});
        expect(store.timeEntries()).toEqual([LATEST, EARLIER]);

        restService.deleteTimeEntry.and.returnValue(of(undefined));
        restService.getTimeEntries.and.returnValue(of([EARLIER]));
        store.deleteTimeEntry({task: TASK, timeEntry: LATEST});

        expect(store.timeEntries()).toEqual([EARLIER]);
    });
});
