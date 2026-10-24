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

  it('should show the given title and empty state', () => {
    fixture.componentRef.setInput('title', 'Past events');
    fixture.componentRef.setInput('emptyTitle', 'No past events');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Past events');
    expect(text).toContain('No past events');
  });
});
