import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarShellComponent } from './calendar-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('CalendarShellComponent', () => {
  let component: CalendarShellComponent;
  let fixture: ComponentFixture<CalendarShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
