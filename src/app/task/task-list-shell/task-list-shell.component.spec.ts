import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListShellComponent } from './task-list-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('TaskListShellComponent', () => {
  let component: TaskListShellComponent;
  let fixture: ComponentFixture<TaskListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListShellComponent],
      providers: provideTestDependencies()
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
