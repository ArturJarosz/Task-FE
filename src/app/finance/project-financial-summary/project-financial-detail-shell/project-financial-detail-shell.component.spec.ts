import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFinancialDetailShellComponent } from './project-financial-detail-shell.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('FinancialDetailShellComponent', () => {
  let component: ProjectFinancialDetailShellComponent;
  let fixture: ComponentFixture<ProjectFinancialDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectFinancialDetailShellComponent],
      providers: provideTestDependencies()
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectFinancialDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
