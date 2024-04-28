import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailShellComponent } from './task-detail-shell.component';

describe('TaskDetailShellComponent', () => {
  let component: TaskDetailShellComponent;
  let fixture: ComponentFixture<TaskDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskDetailShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
