import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectFinancialDetailComponent } from './project-financial-detail.component';

describe('FinancialDetailComponent', () => {
  let component: ProjectFinancialDetailComponent;
  let fixture: ComponentFixture<ProjectFinancialDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectFinancialDetailComponent]
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
