import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupplyComponent } from './add-supply.component';

describe('AddSupplyComponent', () => {
  let component: AddSupplyComponent;
  let fixture: ComponentFixture<AddSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddSupplyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
