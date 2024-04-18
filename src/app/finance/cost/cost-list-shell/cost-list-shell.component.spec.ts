import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostListShellComponent } from './cost-list-shell.component';

describe('CostListShellComponent', () => {
  let component: CostListShellComponent;
  let fixture: ComponentFixture<CostListShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostListShellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
