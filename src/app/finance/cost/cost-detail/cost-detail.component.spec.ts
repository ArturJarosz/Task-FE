import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostDetailComponent } from './cost-detail.component';

describe('CostDetailComponent', () => {
  let component: CostDetailComponent;
  let fixture: ComponentFixture<CostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
