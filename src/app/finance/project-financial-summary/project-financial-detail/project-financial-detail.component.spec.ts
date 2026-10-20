import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFinancialDetailComponent } from './project-financial-detail.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('FinancialDetailComponent', () => {
  let component: ProjectFinancialDetailComponent;
  let fixture: ComponentFixture<ProjectFinancialDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFinancialDetailComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFinancialDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
