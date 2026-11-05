import { ComponentFixture, TestBed } from '@angular/core/testing';
import {patchState} from "@ngrx/signals";
import {unprotected} from "@ngrx/signals/testing";

import { TaskDetailShellComponent } from './task-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {ArchitectStore} from "../../architect/state/architect.state";
import {UserStore} from "../../shared/user/state/user.state";
import {TaskStore} from "../state/task.state";
import {TimeEntryStore} from "../../time-entry/state/time-entry.state";

describe('TaskDetailShellComponent', () => {
  let component: TaskDetailShellComponent;
  let fixture: ComponentFixture<TaskDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('logging time', () => {
    beforeEach(() => {
      // The task (id 0, as the spec has no route) belongs to architect 2; the logged-in user is linked to architect 3
      patchState(unprotected(TestBed.inject(TaskStore)), {task: {id: 0, name: 'Moodboard', architectId: 2}});
      patchState(unprotected(TestBed.inject(ArchitectStore)), {architects: [
        {id: 2, firstName: 'Oskar', lastName: 'Ciuryła'},
        {id: 3, firstName: 'Alicja', lastName: 'Ciuryła', linkedUser: {id: 30}}
      ]});
    });

    it("starts the Log time dialog with the logged-in user's architect", () => {
      patchState(unprotected(TestBed.inject(UserStore)), {currentUser: {id: 30}});
      component.onLogTime();
      expect(component.$loggedTimeEntry()?.architectId).toBe(3);
    });

    it("logs quick time for the logged-in user's architect", () => {
      patchState(unprotected(TestBed.inject(UserStore)), {currentUser: {id: 30}});
      const saveTimeEntry = spyOn(TestBed.inject(TimeEntryStore), 'saveTimeEntry');
      component.onQuickLog({durationMinutes: 90, onSaved: () => undefined});
      expect(saveTimeEntry.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
        timeEntry: jasmine.objectContaining({architectId: 3, durationMinutes: 90})
      }));
    });

    it('opens the Log time dialog with the typed time while the user is not loaded, and clears the card once saved', () => {
      const saveTimeEntry = spyOn(TestBed.inject(TimeEntryStore), 'saveTimeEntry');
      const onSaved = jasmine.createSpy('onSaved');

      component.onQuickLog({durationMinutes: 90, onSaved});

      expect(saveTimeEntry).not.toHaveBeenCalled();
      expect(component.$loggedTimeEntry()).toEqual({durationMinutes: 90});

      component.onSaveTimeEntry({architectId: 2, durationMinutes: 90});
      (saveTimeEntry.calls.mostRecent().args[0] as {afterSave: () => void}).afterSave();

      expect(onSaved).toHaveBeenCalled();
      expect(component.$loggedTimeEntry()).toBeNull();
    });

    it("falls back to the task's architect when no architect is linked to the user", () => {
      patchState(unprotected(TestBed.inject(UserStore)), {currentUser: {id: 99}});
      component.onLogTime();
      expect(component.$loggedTimeEntry()?.architectId).toBe(2);
    });
  });
});
