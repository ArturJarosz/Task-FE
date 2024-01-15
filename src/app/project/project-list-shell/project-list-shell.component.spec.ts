import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListShellComponent } from './project-list-shell.component';

describe('ProjectShellComponent', () => {
  let component: ProjectListShellComponent;
  let fixture: ComponentFixture<ProjectListShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectListShellComponent]
    });
    fixture = TestBed.createComponent(ProjectListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
