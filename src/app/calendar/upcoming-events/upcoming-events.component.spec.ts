import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingEventsComponent } from './upcoming-events.component';

describe('UpcomingEventsComponent', () => {
  let component: UpcomingEventsComponent;
  let fixture: ComponentFixture<UpcomingEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the client and project an event is connected with', () => {
    fixture.componentRef.setInput('clients', [{id: 1, firstName: 'Anna', lastName: 'Nowak'}]);
    fixture.componentRef.setInput('projects', [{id: 10, name: 'House'}]);

    expect(component.clientName({clientId: 1})).toBe('Anna Nowak');
    expect(component.projectName({projectId: 10})).toBe('House');
    expect(component.clientName({})).toBe('');
    expect(component.projectName({})).toBe('');
  });

  it('should show the time without repeating the date of the badge', () => {
    fixture.componentRef.setInput('events', [
      {id: 1, name: 'Visit', startDateTime: '2026-11-06T09:00:00', endDateTime: '2026-11-06T17:00:00'},
      {id: 2, name: 'Fair', startDateTime: '2026-11-06T09:00:00', endDateTime: '2026-11-08T17:00:00'},
      {id: 3, name: 'Delivery', allDay: true, startDateTime: '2026-11-06T00:00:00', endDateTime: '2026-11-06T00:00:00'},
      {id: 4, name: 'Trip', allDay: true, startDateTime: '2026-11-06T00:00:00', endDateTime: '2026-11-08T00:00:00'},
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('09:00–17:00');
    expect(text).toContain('09:00, until 08.11.2026 17:00');
    expect(text).toContain('All day, until 08.11.2026');
    expect(text).not.toContain('06.11.2026');
  });

  it('should show the given title and empty state', () => {
    fixture.componentRef.setInput('title', 'Past events');
    fixture.componentRef.setInput('emptyTitle', 'No past events');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Past events');
    expect(text).toContain('No past events');
  });
});
