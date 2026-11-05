import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TimeEntriesDialogComponent} from './time-entries-dialog.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('TimeEntriesDialogComponent', () => {
    let fixture: ComponentFixture<TimeEntriesDialogComponent>;
    let component: TimeEntriesDialogComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TimeEntriesDialogComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(TimeEntriesDialogComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('architects', [{id: 7, firstName: 'Anna', lastName: 'Nowak'}]);
        fixture.componentRef.setInput('taskName', 'Floor plan');
        fixture.componentRef.setInput('timeEntries', [
            {id: 1, workDate: '2026-11-03', architectId: 7, durationMinutes: 300},
            {id: 2, workDate: '2026-10-28', architectId: 7, durationMinutes: 150, note: 'Client call'},
        ]);
        fixture.componentRef.setInput('visible', true);
        fixture.detectChanges();
    });

    function dialogText(): string {
        return (document.body.textContent ?? '').replace(/\s+/g, ' ');
    }

    it('should list every entry under the task and its total', () => {
        expect(dialogText()).toContain('Time entries');
        expect(dialogText()).toContain('Floor plan · 7 h 30 min in 2 entries');
        expect(dialogText()).toContain('03.11.2026');
        expect(dialogText()).toContain('Client call');
        expect(dialogText()).toContain('2 h 30 min');
        expect(component.getArchitectName(7)).toBe('Anna Nowak');
    });

    it('should offer to edit and delete an entry from its row menu', () => {
        const edited = jasmine.createSpy('edit');
        const deleted = jasmine.createSpy('delete');
        component.editEntry.subscribe(edited);
        component.deleteEntry.subscribe(deleted);
        const menu = jasmine.createSpyObj('Menu', ['toggle']);

        component.openRowMenu(new MouseEvent('click'), {id: 2}, menu);
        component.rowMenuItems.find(item => item.label === 'Edit')!.command!({});
        component.rowMenuItems.find(item => item.label === 'Delete')!.command!({});

        expect(menu.toggle).toHaveBeenCalled();
        expect(edited).toHaveBeenCalledWith({id: 2});
        expect(deleted).toHaveBeenCalledWith({id: 2});
    });
});
