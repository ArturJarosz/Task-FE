import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';

import {ProjectHistoryComponent} from './project-history.component';
import {ProjectHistoryStore} from '../state/project-history.state';
import {provideTestDependencies} from '../../../testing/test-providers';
import {HistoryEntry} from '../../generated/models/history-entry';
import {HistoryAction} from '../../generated/models/history-action';
import {HistoryField} from '../../generated/models/history-field';
import {HistoryRecordType} from '../../generated/models/history-record-type';

// Latest first, as the backend returns them
const HISTORY: HistoryEntry[] = [
    {
        dateTime: '2026-11-10T14:32:00', author: {id: 1, username: 'Anna Nowak'}, recordType: HistoryRecordType.TASK,
        recordId: 30, recordName: 'Site photos', stageId: 20, stageName: 'Concept', action: HistoryAction.REMOVED,
        changes: []
    },
    {
        dateTime: '2026-11-10T09:12:00', author: {id: 1, username: 'Anna Nowak'},
        recordType: HistoryRecordType.CONTRACT, recordId: 5, action: HistoryAction.CHANGED,
        changes: [{field: HistoryField.OFFER_VALUE, oldValue: '8000', newValue: '9500.5'},
            {field: HistoryField.DEADLINE, newValue: '2027-02-11'}]
    },
    {
        dateTime: '2026-11-09T16:20:00', author: {id: 2, username: 'Piotr Kowal'}, recordType: HistoryRecordType.TASK,
        recordId: 31, recordName: 'Lighting plan', stageId: 20, stageName: 'Concept', action: HistoryAction.CHANGED,
        changes: [{field: HistoryField.NOTE, oldValue: 'Two lamps', newValue: 'Three lamps'}]
    },
    {
        dateTime: '2026-11-02T16:20:00', recordType: HistoryRecordType.PROJECT, recordId: 1, recordName: 'House',
        action: HistoryAction.CREATED, changes: []
    },
];

describe('ProjectHistoryComponent', () => {
    let fixture: ComponentFixture<ProjectHistoryComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectHistoryComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(ProjectHistoryComponent);
        fixture.componentRef.setInput('projectId', 1);
    });

    afterEach(() => httpTesting.verify());

    function open(stageId?: number, taskId?: number): void {
        fixture.componentRef.setInput('stageId', stageId);
        fixture.componentRef.setInput('taskId', taskId);
        fixture.detectChanges();
        fixture.componentInstance.open();
        fixture.detectChanges();
    }

    // Answers the request for the history with given entries, the ones the server returns for the stage or task
    function show(history: HistoryEntry[], stageId?: number, taskId?: number): string {
        open(stageId, taskId);
        const request = httpTesting.expectOne(request => request.url.endsWith('/projects/1/history'));
        expect(request.request.params.get('stageId')).toBe(stageId === undefined ? null : `${stageId}`);
        expect(request.request.params.get('taskId')).toBe(taskId === undefined ? null : `${taskId}`);
        request.flush(history);
        fixture.detectChanges();
        return text();
    }

    // The panel is appended to the body
    function panel(): HTMLElement {
        return document.querySelector('.p-drawer') as HTMLElement;
    }

    function text(): string {
        return panel().textContent!.replace(/\s+/g, ' ');
    }

    function entryTexts(): string[] {
        return Array.from(panel().querySelectorAll('li') as NodeListOf<HTMLElement>)
            .map(entry => entry.querySelector('p')!.textContent!.replace(/\s+/g, ' ').trim());
    }

    it('should load the history only when opened', () => {
        fixture.detectChanges();
        httpTesting.expectNone(request => request.url.endsWith('/projects/1/history'));

        show(HISTORY);

        expect(entryTexts().length).toBe(4);
    });

    it('should say who changed what, latest first', () => {
        show(HISTORY);

        expect(entryTexts()).toEqual([
            'Anna Nowak removed task Site photos in Concept',
            'Anna Nowak changed the contract',
            'Piotr Kowal changed task Lighting plan in Concept',
            'Someone created the project',
        ]);
    });

    it('should show old and new values formatted, with "Not set" for an empty one', () => {
        const shown = show(HISTORY);

        expect(shown).toContain('Offer value 8 000,00 zł changed to 9 500,50 zł');
        expect(shown).toContain('Deadline Not set changed to 11.02.2027');
    });

    it('should show a changed note only when asked', () => {
        show(HISTORY);
        expect(text()).not.toContain('Three lamps');

        const showButton = Array.from(panel().querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
            .find(button => button.textContent?.trim() === 'Show')!;
        showButton.click();
        fixture.detectChanges();

        expect(text()).toContain('Before: Two lamps');
        expect(text()).toContain('After: Three lamps');
    });

    it('should link to a stage or task, but not to a removed one', () => {
        show(HISTORY);

        const links = Array.from(panel().querySelectorAll('li a') as NodeListOf<HTMLAnchorElement>);
        expect(links.map(link => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
            ['Lighting plan', '/projects/1/stages/20/tasks/31']]);
    });

    it('should not link to a record removed later', () => {
        show([HISTORY[0], {...HISTORY[2], recordId: 30, recordName: 'Site photos'}]);

        expect(panel().querySelectorAll('li a').length).toBe(0);
    });

    it('should open on the first page of all parts again', () => {
        show(HISTORY);
        const contractButton = Array.from(panel().querySelectorAll('.app-seg-item') as NodeListOf<HTMLButtonElement>)
            .find(button => button.textContent?.includes('Contract'))!;
        contractButton.click();
        fixture.componentInstance.page.set(1);

        fixture.componentInstance.open();
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/history')).flush(HISTORY);
        fixture.detectChanges();

        expect(fixture.componentInstance.part()).toBe('all');
        expect(fixture.componentInstance.page()).toBe(0);
        expect(entryTexts().length).toBe(4);
    });

    it('should filter by part of the project and count each part', () => {
        show(HISTORY);
        const contractButton = Array.from(panel().querySelectorAll('.app-seg-item') as NodeListOf<HTMLButtonElement>)
            .find(button => button.textContent?.includes('Contract'))!;
        expect(contractButton.textContent?.replace(/\s+/g, ' ').trim()).toBe('Contract 1');

        contractButton.click();
        fixture.detectChanges();

        expect(entryTexts()).toEqual(['Anna Nowak changed the contract']);
    });

    it('should show only the task, without the filter, on a task page', () => {
        const shown = show([HISTORY[2]], 20, 31);

        expect(entryTexts()).toEqual(['Piotr Kowal changed task Lighting plan']);
        expect(panel().querySelector('.app-seg')).toBeNull();
        expect(shown).not.toContain('in Concept');
    });

    it('should show the stage and its tasks on a stage page', () => {
        show([HISTORY[0], HISTORY[2]], 20);

        expect(entryTexts()).toEqual([
            'Anna Nowak removed task Site photos',
            'Piotr Kowal changed task Lighting plan',
        ]);
    });

    it('should ask to try again when the history fails to load', () => {
        open();
        httpTesting.expectOne(request => request.url.endsWith('/projects/1/history'))
            .flush('', {status: 500, statusText: 'Server error'});
        fixture.detectChanges();

        expect(text()).toContain("Couldn't load the history");
        expect(text()).toContain('Try again');
    });

    it('should drop the history of another project, stage or task', () => {
        const store = TestBed.inject(ProjectHistoryStore);
        show(HISTORY);

        store.setScope({projectId: 1, stageId: 20});

        expect(store.history()).toBeNull();
        expect(store.historyLoading()).toBeTrue();
    });
});
