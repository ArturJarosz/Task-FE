import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelectArg, EventClickArg, EventHoveringArg, EventMountArg } from '@fullcalendar/core';
import { CalendarEventSyncStatus } from '../../generated/models/calendar-event-sync-status';
import { CalendarViewComponent, weekViewHours } from './calendar-view.component';
import { EventSelection } from '../model/calendar.model';

describe('CalendarViewComponent', () => {
  let component: CalendarViewComponent;
  let fixture: ComponentFixture<CalendarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should place overlapping events side by side', () => {
    expect(component.calendarOptions.slotEventOverlap).toBeFalse();
  });

  describe('week view hours', () => {
    const timed = (start: string, end: string) =>
      ({startDateTime: `2026-11-06T${start}:00`, endDateTime: `2026-11-06T${end}:00`});

    it('should show working hours without events outside them', () => {
      expect(weekViewHours([])).toEqual({slotMinTime: '07:00:00', slotMaxTime: '20:00:00'});
      expect(weekViewHours([timed('09:00', '17:00')])).toEqual({slotMinTime: '07:00:00', slotMaxTime: '20:00:00'});
    });

    it('should extend to fit earlier and later events', () => {
      expect(weekViewHours([timed('05:30', '06:00'), timed('21:40', '22:40')]))
        .toEqual({slotMinTime: '05:00:00', slotMaxTime: '23:00:00'});
    });

    it('should show an event without a duration at the end of the day', () => {
      expect(weekViewHours([timed('21:43', '21:43')])).toEqual({slotMinTime: '07:00:00', slotMaxTime: '22:00:00'});
    });

    it('should show the whole day for an event running through midnight', () => {
      expect(weekViewHours([{startDateTime: '2026-10-08T13:00:00', endDateTime: '2026-10-09T19:00:00'}]))
        .toEqual({slotMinTime: '00:00:00', slotMaxTime: '24:00:00'});
    });

    it('should not treat an event ending at midnight as running into the next day', () => {
      expect(weekViewHours([{startDateTime: '2026-11-06T22:00:00', endDateTime: '2026-11-07T00:00:00'}]))
        .toEqual({slotMinTime: '07:00:00', slotMaxTime: '24:00:00'});
    });

    it('should ignore all-day events', () => {
      expect(weekViewHours([{allDay: true, startDateTime: '2026-11-06T00:00:00', endDateTime: '2026-11-06T00:00:00'}]))
        .toEqual({slotMinTime: '07:00:00', slotMaxTime: '20:00:00'});
    });

    it('should apply the hours to the calendar when events change', () => {
      fixture.componentRef.setInput('events', [{id: 1, name: 'Late', ...timed('21:40', '22:40')}]);
      fixture.detectChanges();

      expect(component.calendarOptions.slotMaxTime).toBe('23:00:00');
    });
  });

  describe('event details tooltip', () => {
    const event = {id: 5, name: 'Site visit', description: 'Bring samples', syncStatus: CalendarEventSyncStatus.PENDING,
      startDateTime: '2026-11-06T09:00:00', endDateTime: '2026-11-06T17:00:00', clientId: 1, projectId: 10};

    function hover(): void {
      fixture.componentRef.setInput('events', [event]);
      fixture.componentRef.setInput('syncIssue', 'CONNECTION_FAILED');
      fixture.componentRef.setInput('clients', [{id: 1, firstName: 'Anna', lastName: 'Nowak'}]);
      fixture.componentRef.setInput('projects', [{id: 10, name: 'House'}]);
      (component.calendarOptions.eventMouseEnter as (arg: EventHoveringArg) => void)(
        {event: {id: '5'}, el: document.createElement('div')} as unknown as EventHoveringArg);
      fixture.detectChanges();
    }

    it('should show the event details on hover', () => {
      hover();

      const text = fixture.nativeElement.querySelector('[role=tooltip]').textContent;
      ['Site visit', '06.11.2026 · 09:00–17:00', 'Anna Nowak', 'House', 'Bring samples', 'Waiting to sync']
        .forEach(detail => expect(text).toContain(detail));
    });

    it('should not mention sync while it works', () => {
      hover();
      fixture.componentRef.setInput('syncIssue', null);
      (component.calendarOptions.eventMouseEnter as (arg: EventHoveringArg) => void)(
        {event: {id: '5'}, el: document.createElement('div')} as unknown as EventHoveringArg);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[role=tooltip]').textContent).not.toContain('sync');
    });

    it('should leave out details the event does not have', () => {
      fixture.componentRef.setInput('events', [{id: 6, name: 'Other', startDateTime: '2026-11-06T09:00:00'}]);
      (component.calendarOptions.eventMouseEnter as (arg: EventHoveringArg) => void)(
        {event: {id: '6'}, el: document.createElement('div')} as unknown as EventHoveringArg);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('[role=tooltip] .pi').length).toBe(1);
    });

    describe('on focus', () => {
      function mount(focusVisible: boolean): HTMLElement {
        const el = document.createElement('div');
        spyOn(el, 'matches').and.returnValue(focusVisible);
        fixture.componentRef.setInput('events', [event]);
        (component.calendarOptions.eventDidMount as (arg: EventMountArg) => void)(
          {event: {id: '5'}, el} as unknown as EventMountArg);
        return el;
      }

      it('should show the details for keyboard focus', () => {
        mount(true).dispatchEvent(new FocusEvent('focusin'));
        expect(component.tooltip()?.name).toBe('Site visit');
      });

      it('should not show the details for focus from a click', () => {
        mount(false).dispatchEvent(new FocusEvent('focusin'));
        expect(component.tooltip()).toBeNull();
      });

      it('should not show the details when focus returns from the event dialog', () => {
        const el = mount(true);
        (component.calendarOptions.eventClick as (arg: EventClickArg) => void)({event: {id: '5'}} as EventClickArg);

        el.dispatchEvent(new FocusEvent('focusin'));
        expect(component.tooltip()).toBeNull();
      });
    });

    it('should hide the details when the mouse leaves or the event is opened', () => {
      hover();
      (component.calendarOptions.eventMouseLeave as (arg: EventHoveringArg) => void)({} as EventHoveringArg);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role=tooltip]')).toBeNull();

      hover();
      (component.calendarOptions.eventClick as (arg: EventClickArg) => void)({event: {id: '5'}} as EventClickArg);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role=tooltip]')).toBeNull();
    });
  });

  function select(start: Date, end: Date, allDay: boolean): EventSelection {
    let emitted: EventSelection | undefined;
    component.slotSelected.subscribe(selection => emitted = selection);
    (component.calendarOptions.select as (arg: DateSelectArg) => void)({start, end, allDay} as DateSelectArg);
    return emitted!;
  }

  it('should end a single-day selection on the same day', () => {
    const selection = select(new Date(2026, 9, 20), new Date(2026, 9, 21), true);
    expect(selection.date).toEqual(new Date(2026, 9, 20));
    expect(selection.endDate).toEqual(new Date(2026, 9, 20));
  });

  it('should end a multi-day selection on the last selected day', () => {
    const selection = select(new Date(2026, 9, 20), new Date(2026, 9, 23), true);
    expect(selection.endDate).toEqual(new Date(2026, 9, 22));
  });

  it('should keep the end of a timed selection', () => {
    const selection = select(new Date(2026, 9, 20, 9), new Date(2026, 9, 20, 10), false);
    expect(selection.endDate).toEqual(new Date(2026, 9, 20, 10));
  });

  it('should show an all-day event through its last day', () => {
    component.events = [{id: 1, name: 'Trip', startDateTime: '2026-10-20T00:00:00', endDateTime: '2026-10-22T00:00:00', allDay: true}];
    component.ngOnChanges({events: {} as any});
    const events = component.calendarOptions.events as any[];
    expect(events[0].end).toEqual(new Date(2026, 9, 23));
  });
});
