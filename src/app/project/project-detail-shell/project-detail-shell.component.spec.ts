import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailShellComponent } from './project-detail-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ProjectDetailShellComponent', () => {
  let component: ProjectDetailShellComponent;
  let fixture: ComponentFixture<ProjectDetailShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectDetailShellComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(ProjectDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
