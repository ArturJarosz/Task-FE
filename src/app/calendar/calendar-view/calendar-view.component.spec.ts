import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelectArg } from '@fullcalendar/core';
import { CalendarViewComponent } from './calendar-view.component';
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
