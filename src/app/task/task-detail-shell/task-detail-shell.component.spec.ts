import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailShellComponent } from './task-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('TaskDetailShellComponent', () => {
  let component: TaskDetailShellComponent;
  let fixture: ComponentFixture<TaskDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailShellComponent],
      providers: provideTestDependencies()
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
