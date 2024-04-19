import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCostComponent } from './add-cost.component';

describe('AddCostComponent', () => {
  let component: AddCostComponent;
  let fixture: ComponentFixture<AddCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
