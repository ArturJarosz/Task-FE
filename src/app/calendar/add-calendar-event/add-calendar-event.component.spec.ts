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
});
