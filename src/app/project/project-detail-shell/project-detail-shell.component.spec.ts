import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailShellComponent } from './project-detail-shell.component';

describe('ProjectDetailShellComponent', () => {
  let component: ProjectDetailShellComponent;
  let fixture: ComponentFixture<ProjectDetailShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDetailShellComponent]
    });
    fixture = TestBed.createComponent(ProjectDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
