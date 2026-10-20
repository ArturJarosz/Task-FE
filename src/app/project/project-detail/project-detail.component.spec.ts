import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailComponent } from './project-detail.component';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: provideTestDependencies()
    });
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    // The form is built in ngOnChanges, which only runs once an input is set
    fixture.componentRef.setInput('project', null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
