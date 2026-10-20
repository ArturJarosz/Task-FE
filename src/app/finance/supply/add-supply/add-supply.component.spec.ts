import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupplyComponent } from './add-supply.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('AddSupplyComponent', () => {
  let component: AddSupplyComponent;
  let fixture: ComponentFixture<AddSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSupplyComponent],
      providers: provideTestDependencies()
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
