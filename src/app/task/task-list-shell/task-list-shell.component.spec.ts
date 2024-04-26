import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListShellComponent } from './task-list-shell.component';

describe('TaskListShellComponent', () => {
  let component: TaskListShellComponent;
  let fixture: ComponentFixture<TaskListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
