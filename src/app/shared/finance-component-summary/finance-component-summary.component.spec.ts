import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceComponentSummaryComponent } from './finance-component-summary.component';

describe('FinanceComponentSummaryComponent', () => {
  let component: FinanceComponentSummaryComponent;
  let fixture: ComponentFixture<FinanceComponentSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FinanceComponentSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceComponentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
