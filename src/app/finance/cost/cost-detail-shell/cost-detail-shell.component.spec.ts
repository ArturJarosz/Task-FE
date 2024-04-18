import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostDetailShellComponent } from './cost-detail-shell.component';

describe('CostDetailShellComponent', () => {
  let component: CostDetailShellComponent;
  let fixture: ComponentFixture<CostDetailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostDetailShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostDetailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
