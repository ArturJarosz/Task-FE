import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListShellComponent } from './project-list-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ProjectShellComponent', () => {
  let component: ProjectListShellComponent;
  let fixture: ComponentFixture<ProjectListShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectListShellComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(ProjectListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
