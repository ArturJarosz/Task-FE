import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCalendarEventComponent } from './add-calendar-event.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('AddCalendarEventComponent', () => {
  let component: AddCalendarEventComponent;
  let fixture: ComponentFixture<AddCalendarEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCalendarEventComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCalendarEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default a new event to one hour starting now, without seconds', () => {
    const {startDateTime, endDateTime} = component.calendarEventForm.getRawValue();

    expect(startDateTime.getSeconds()).toBe(0);
    expect(endDateTime.getTime() - startDateTime.getTime()).toBe(60 * 60 * 1000);
  });

  describe('client and project', () => {
    const clients = [{id: 1, firstName: 'Anna', lastName: 'Nowak'}, {id: 2, firstName: 'Jan', lastName: 'Kowal'}];
    const projects = [{id: 10, name: 'House', client: clients[0]}, {id: 20, name: 'Office', client: clients[1]}];

    beforeEach(() => {
      fixture.componentRef.setInput('clients', clients);
      fixture.componentRef.setInput('projects', projects);
      fixture.detectChanges();
    });

    it('should offer all clients and projects when nothing is selected', () => {
      expect(component.clientOptions.map(option => option.name)).toEqual(['Anna Nowak', 'Jan Kowal']);
      expect(component.projectOptions.map(project => project.id)).toEqual([10, 20]);
    });

    it('should select the client of the selected project', () => {
      component.calendarEventForm.controls.projectId.setValue(20);
      component.onProjectChange();

      expect(component.calendarEventForm.controls.clientId.value).toBe(2);
      expect(component.projectOptions.map(project => project.id)).toEqual([20]);
    });

    it('should clear a project of another client when the client changes', () => {
      component.calendarEventForm.controls.projectId.setValue(20);
      component.onProjectChange();

      component.calendarEventForm.controls.clientId.setValue(1);
      component.onClientChange();

      expect(component.calendarEventForm.controls.projectId.value).toBeNull();
      expect(component.projectOptions.map(project => project.id)).toEqual([10]);
    });

    it('should clear the project when the client is cleared', () => {
      component.calendarEventForm.controls.projectId.setValue(20);
      component.onProjectChange();

      component.calendarEventForm.controls.clientId.setValue(null);
      component.onClientChange();

      expect(component.calendarEventForm.controls.projectId.value).toBeNull();
      expect(component.projectOptions.length).toBe(2);
    });

    it('should lock the client and project of a new event opened from their page', () => {
      const createSpy = spyOn(component.calendarStore, 'createCalendarEvent');
      fixture.componentRef.setInput('fixedClientId', 1);
      fixture.componentRef.setInput('fixedProjectId', 10);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const controls = component.calendarEventForm.controls;
      expect(controls.clientId.disabled).toBeTrue();
      expect(controls.projectId.disabled).toBeTrue();
      controls.name.setValue('Visit');
      component.onSave();

      const saved = createSpy.calls.mostRecent().args[0] as {event: {clientId?: number, projectId?: number}};
      expect(saved.event.clientId).toBe(1);
      expect(saved.event.projectId).toBe(10);
    });

    it('should let an edited event change its client and project on their page', () => {
      fixture.componentRef.setInput('fixedClientId', 1);
      fixture.componentRef.setInput('event', {id: 5, name: 'Visit', clientId: 1, projectId: 10});
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(component.calendarEventForm.controls.clientId.enabled).toBeTrue();
      expect(component.calendarEventForm.controls.projectId.enabled).toBeTrue();
    });

    it('should show the connections of an edited event and keep them when saving', () => {
      const createSpy = spyOn(component.calendarStore, 'updateCalendarEvent');
      fixture.componentRef.setInput('event', {
        id: 5, name: 'Visit', startDateTime: '2026-11-06T10:00:00', endDateTime: '2026-11-06T11:00:00',
        clientId: 1, projectId: 10
      });
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(component.projectOptions.map(project => project.id)).toEqual([10]);
      component.onSave();

      const saved = createSpy.calls.mostRecent().args[0] as {event: {clientId?: number, projectId?: number}};
      expect(saved.event.clientId).toBe(1);
      expect(saved.event.projectId).toBe(10);
    });
  });
});
